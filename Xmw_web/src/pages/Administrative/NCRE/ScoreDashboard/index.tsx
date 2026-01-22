import { useRequest } from '@umijs/max';
import { Empty, Select, Spin, Tabs } from 'antd';
import React, { useMemo, useState } from 'react';

import { getCetList, getScoreGroups } from '@/services/administrative/ncre';

import ClassListView from './components/ClassListView';
import StudentListView from './components/StudentListView';
import type { GroupScore } from './components/types';

export default function ScoreDashboard() {
  const [view, setView] = useState<'groups' | 'students'>('groups');
  const [selectedGroup, setSelectedGroup] = useState<GroupScore | null>(null);
  const [dimension, setDimension] = useState<'class_name' | 'major' | 'department'>('class_name');
  const [level, setLevel] = useState<string | undefined>(undefined);
  const [semesterKey, setSemesterKey] = useState<string | undefined>(undefined);

  const { data: resp, loading, error } = useRequest(
    () =>
      getScoreGroups({
        group_by: dimension,
        level,
      }),
    {
      refreshDeps: [dimension, level],
    },
  );

  const { data: batchResp, loading: batchLoading } = useRequest(
    () => getCetList({ current: 1, pageSize: 9999 }),
    { refreshDeps: [] },
  );

  const groups: GroupScore[] = useMemo(() => {
    const raw = (resp as any)?.data ?? resp ?? [];
    const list = Array.isArray(raw) ? raw : Array.isArray(raw?.list) ? raw.list : [];
    return list.map((g: any) => ({
      id: String(g?.id ?? g?.name ?? ''),
      name: String(g?.name ?? ''),
      year: g?.year ? String(g.year) : undefined,
      semester: g?.semester ? String(g.semester) : undefined,
      students: Array.isArray(g?.students)
        ? g.students.map((s: any) => ({
            id: String(s?.id ?? ''),
            name: String(s?.name ?? ''),
            groupId: String(s?.groupId ?? s?.classId ?? g?.name ?? ''),
            scores: Array.isArray(s?.scores) ? s.scores.map((x: any) => Number(x) || 0) : [],
          }))
        : [],
    }));
  }, [resp]);

  const formatSemesterLabel = (record: Pick<GroupScore, 'year' | 'semester'>) => {
    const year = (record.year || '').trim();
    const semester = (record.semester || '').trim();
    if (!year && !semester) return '';
    if (year && semester) {
      return /^\d+$/.test(semester) ? `${year} 第${semester}学期` : `${year} ${semester}`;
    }
    return year || semester;
  };
  const getSemesterKey = (record: Pick<GroupScore, 'year' | 'semester'>) => {
    const year = (record.year || '').trim();
    const semester = (record.semester || '').trim();
    if (!year && !semester) return undefined;
    return `${year}__${semester}`;
  };

  const semesterOptions = useMemo(() => {
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
      if (/^\d+$/.test(s)) return Number(s);
      if (s.includes('上')) return 1;
      if (s.includes('下')) return 2;
      return 99;
    };

    return Array.from(map.entries())
      .sort((a, b) => {
        const ay = Number(a[1].year) || 0;
        const by = Number(b[1].year) || 0;
        if (ay !== by) return by - ay;
        return semesterRank(a[1].semester) - semesterRank(b[1].semester);
      })
      .map(([value, meta]) => ({ value, label: meta.label }));
  }, [batchResp, semesterKey]);

  const filteredGroups = useMemo(() => {
    return groups.filter((g) => {
      if (semesterKey) {
        const k = getSemesterKey(g);
        if (k !== semesterKey) return false;
      }
      return true;
    });
  }, [groups, semesterKey]);

  const groupLabel = useMemo(() => {
    switch (dimension) {
      case 'department':
        return '学院';
      case 'major':
        return '专业';
      case 'class_name':
      default:
        return '班级';
    }
  }, [dimension]);

  const levelOptions = [
    { value: undefined, label: '全部级别' },
    { value: '计算机一级', label: '计算机一级' },
    { value: '计算机二级', label: '计算机二级' },
    { value: '计算机三级', label: '计算机三级' },
    { value: '计算机四级', label: '计算机四级' },
  ];

  const handleSelectGroup = (g: GroupScore) => {
    setSelectedGroup(g);
    setView('students');
  };

  const handleBackToGroups = () => {
    setSelectedGroup(null);
    setView('groups');
  };

  return (
    <div className="space-y-6 p-6">
      {view === 'groups' && (
        <>
          <Tabs
            activeKey={dimension}
            onChange={(key) => {
              setDimension(key as any);
              setSelectedGroup(null);
              setView('groups');
              setSemesterKey(undefined);
            }}
            items={[
              { key: 'class_name', label: '班级' },
              { key: 'major', label: '专业' },
              { key: 'department', label: '学院' },
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
              placeholder="考试级别"
              value={level}
              onChange={(v) => setLevel(v)}
              allowClear
              options={levelOptions as any}
              style={{ width: 180 }}
            />
          </div>
        </>
      )}

      {view === 'groups' && (
        <Spin spinning={loading}>
          {!loading && groups.length === 0 ? (
            <Empty description={error ? '加载失败（请看控制台/Network）' : '暂无成绩数据'} />
          ) : !loading && filteredGroups.length === 0 ? (
            <Empty description="暂无匹配数据" />
          ) : (
            <ClassListView
              groups={filteredGroups}
              loading={loading}
              groupLabel={groupLabel}
              onSelectGroup={handleSelectGroup}
            />
          )}
        </Spin>
      )}

      {view === 'students' && selectedGroup && (
        <StudentListView groupData={selectedGroup} groupLabel={groupLabel} onBack={handleBackToGroups} />
      )}
    </div>
  );
}


