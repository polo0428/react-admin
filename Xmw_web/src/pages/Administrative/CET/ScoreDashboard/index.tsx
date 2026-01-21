import { useRequest } from '@umijs/max';
import { Empty, Select, Spin, Tabs } from 'antd';
import React, { useMemo, useState } from 'react';

import { getCetList, getScoreGroups } from '@/services/administrative/cet';

import ClassListView from './components/ClassListView';
import StudentListView from './components/StudentListView';
import type { ClassScoreGroup } from './components/types';

/**
 * CET 成绩综合看板
 * - 默认展示各班级通过率/人数等汇总表格
 * - 点击班级后，进入该班级学生明细，可查看学生历次 CET-4/6 考试成绩折线
 *
 */
export default function ScoreDashboard() {
  const [view, setView] = useState<'classes' | 'students'>('classes');
  const [selectedClass, setSelectedClass] = useState<ClassScoreGroup | null>(null);
  const [dimension, setDimension] = useState<
    'teaching_class' | 'squadron' | 'brigade' | 'major' | 'student_type'
  >('teaching_class');
  const [semesterKey, setSemesterKey] = useState<string | undefined>(undefined);
  const [gradeFilter, setGradeFilter] = useState<string | undefined>(undefined);
  const [cultivationFilter, setCultivationFilter] = useState<number | undefined>(undefined);

  const {
    data: resp,
    loading,
    error,
  } = useRequest(() => getScoreGroups({ group_by: dimension }), { refreshDeps: [dimension] });

  const { data: batchResp, loading: batchLoading } = useRequest(
    () => getCetList({ current: 1, pageSize: 9999 }),
    {
      refreshDeps: [],
      // 避免首次渲染 batchResp 为 undefined
      onError: (e) => {
        console.error('获取考次列表失败:', e);
      },
    },
  );

  const classes: ClassScoreGroup[] = useMemo(() => {
    const ensureLen8 = (arr: number[] | undefined) => {
      const list = Array.isArray(arr) ? arr.map((v) => Number(v) || 0) : [];
      const last8 = list.length > 8 ? list.slice(-8) : list;
      return [...last8, ...new Array(Math.max(0, 8 - last8.length)).fill(0)];
    };
    const toMaybeStr = (v: any) => {
      const s = v === undefined || v === null ? '' : String(v);
      const t = s.trim();
      return t ? t : undefined;
    };
    const toMaybeNum = (v: any) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : undefined;
    };

    const raw = (resp as any)?.data ?? resp ?? [];
    const list = Array.isArray(raw) ? raw : [];
    return list.map((cls: any) => ({
      id: String(cls?.id ?? cls?.name ?? ''),
      name: String(cls?.name ?? ''),
      year: toMaybeStr(cls?.year),
      semester: toMaybeStr(cls?.semester),
      grade: toMaybeStr(cls?.grade),
      cultivationLevel: toMaybeNum(cls?.cultivation_level),
      students: (cls?.students || []).map((s: any) => ({
        id: String(s?.id ?? ''),
        name: String(s?.name ?? ''),
        classId: String(s?.classId ?? cls?.name ?? ''),
        cet4Scores: ensureLen8(s?.cet4Scores),
        cet6Scores: ensureLen8(s?.cet6Scores),
      })),
    }));
  }, [resp]);

  const formatSemesterLabel = (record: Pick<ClassScoreGroup, 'year' | 'semester'>) => {
    const year = (record.year || '').trim();
    const semester = (record.semester || '').trim();
    if (!year && !semester) return '';
    if (year && semester) {
      return /^\d+$/.test(semester) ? `${year} 第${semester}学期` : `${year} ${semester}`;
    }
    return year || semester;
  };
  const getSemesterKey = (record: Pick<ClassScoreGroup, 'year' | 'semester'>) => {
    const year = (record.year || '').trim();
    const semester = (record.semester || '').trim();
    if (!year && !semester) return undefined;
    return `${year}__${semester}`;
  };
  const formatCultivationLabel = (level?: number) => {
    if (level === 0) return '混合';
    if (level === 1) return '大专';
    if (level === 2) return '本科';
    if (level === 3) return '研究生';
    return '';
  };

  const semesterOptions = useMemo(() => {
    // 学期来源：考试列表（考次列表）接口
    // batchResp 可能为 undefined (请求中)，或者结构不符合预期
    // 这里做更安全的深层解构默认值
    const rawData = (batchResp as any) || {};
    const rawList = rawData?.data?.list ?? rawData?.list ?? [];
    const list = Array.isArray(rawList) ? rawList : [];
    const map = new Map<string, { label: string; year: string; semester: string }>();

    for (const b of list) {
      const year = (b?.year ?? '').toString().trim();
      const semester = (b?.semester ?? '').toString().trim();
      if (!year || !semester) continue;
      const key = `${year}__${semester}`;
      const label = formatSemesterLabel({ year, semester });
      if (!label) continue;
      if (!map.has(key)) map.set(key, { label, year, semester });
    }

    const semesterRank = (s: string) => {
      // 常见场景：1/2 或 上/下
      if (/^\d+$/.test(s)) return Number(s);
      if (s.includes('上')) return 1;
      if (s.includes('下')) return 2;
      return 99;
    };

    return Array.from(map.entries())
      .sort((a, b) => {
        const ay = Number(a[1].year) || 0;
        const by = Number(b[1].year) || 0;
        if (ay !== by) return by - ay; // 年份降序
        return semesterRank(a[1].semester) - semesterRank(b[1].semester);
      })
      .map(([value, meta]) => ({ value, label: meta.label }));
  }, [batchResp]);

  const gradeOptions = useMemo(() => {
    const set = new Set<string>();
    for (const c of classes) {
      const g = (c.grade || '').trim();
      if (g) set.add(g);
    }
    return Array.from(set.values()).map((value) => ({ value, label: value }));
  }, [classes]);

  const cultivationOptions = useMemo(() => {
    const set = new Set<number>();
    for (const c of classes) {
      const v = c.cultivationLevel;
      if (typeof v === 'number' && Number.isFinite(v)) set.add(v);
    }
    const order = (n: number) => (n === 0 ? 99 : n);
    return Array.from(set.values())
      .sort((a, b) => order(a) - order(b))
      .map((value) => ({ value, label: formatCultivationLabel(value) || String(value) }));
  }, [classes]);

  const filteredClasses = useMemo(() => {
    return classes.filter((c) => {
      if (semesterKey) {
        const k = getSemesterKey(c);
        if (k !== semesterKey) return false;
      }
      if (gradeFilter) {
        if ((c.grade || '').trim() !== gradeFilter) return false;
      }
      if (cultivationFilter !== undefined) {
        if (c.cultivationLevel !== cultivationFilter) return false;
      }
      return true;
    });
  }, [classes, semesterKey, gradeFilter, cultivationFilter]);

  const groupLabel = useMemo(() => {
    switch (dimension) {
      case 'squadron':
        return '学员队';
      case 'brigade':
        return '学员大队';
      case 'major':
        return '专业';
      case 'student_type':
        return '学员类型';
      case 'teaching_class':
      default:
        return '教学班';
    }
  }, [dimension]);

  const handleSelectClass = (cls: ClassScoreGroup) => {
    setSelectedClass(cls);
    setView('students');
  };

  const handleBackToClasses = () => {
    setSelectedClass(null);
    setView('classes');
  };

  return (
    <div className="space-y-6 p-6">
      <div className="mx-auto">
        {view === 'classes' && (
          <>
            <Tabs
              activeKey={dimension}
              onChange={(key) => {
                setDimension(key as any);
                setSelectedClass(null);
                setView('classes');
                setSemesterKey(undefined);
                setGradeFilter(undefined);
                setCultivationFilter(undefined);
              }}
              items={[
                { key: 'teaching_class', label: '教学班' },
                { key: 'squadron', label: '学员队' },
                { key: 'brigade', label: '学员大队' },
                { key: 'major', label: '专业' },
                { key: 'student_type', label: '学员类型' },
              ]}
            />
            <div className="flex flex-wrap items-center justify-end gap-3 pb-2">
              <Select
                placeholder="学期"
                value={semesterKey}
                onChange={(v) => setSemesterKey(v)}
                allowClear
                options={semesterOptions}
                disabled={semesterOptions.length === 0}
                loading={batchLoading}
                style={{ width: 180 }}
              />
              <Select
                placeholder="年级"
                value={gradeFilter}
                onChange={(v) => setGradeFilter(v)}
                allowClear
                options={gradeOptions}
                disabled={gradeOptions.length === 0}
                style={{ width: 140 }}
              />
              <Select<number>
                placeholder="培养层次"
                value={cultivationFilter}
                onChange={(v) => setCultivationFilter(v)}
                allowClear
                options={cultivationOptions}
                disabled={cultivationOptions.length === 0}
                style={{ width: 140 }}
              />
            </div>
          </>
        )}
        {view === 'classes' && (
          <Spin spinning={loading}>
            {!loading && classes.length === 0 ? (
              <Empty description={error ? '加载失败（请看控制台/Network）' : '暂无成绩数据'} />
            ) : !loading && filteredClasses.length === 0 ? (
              <Empty description="暂无匹配数据" />
            ) : (
              <ClassListView
                classes={filteredClasses}
                loading={loading}
                groupLabel={groupLabel}
                onSelectClass={handleSelectClass}
              />
            )}
          </Spin>
        )}

        {view === 'students' && selectedClass && (
          <StudentListView
            classData={selectedClass}
            groupLabel={groupLabel}
            onBack={handleBackToClasses}
          />
        )}
      </div>
    </div>
  );
}
