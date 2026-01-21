import { useRequest } from '@umijs/max';
import { Empty, Spin } from 'antd';
import React, { useMemo, useState } from 'react';

import { getAllClassScores } from '@/services/administrative/cet';

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

  const {
    data: resp,
    loading,
    error,
  } = useRequest(getAllClassScores, {
    onSuccess: (res) => {
      // eslint-disable-next-line no-console
      console.log('[ScoreDashboard] getAllClassScores success:', res);
    },
    onError: (e) => {
      // eslint-disable-next-line no-console
      console.error('[ScoreDashboard] getAllClassScores error:', e);
    },
  });

  const classes: ClassScoreGroup[] = useMemo(() => {
    const ensureLen8 = (arr: number[] | undefined) => {
      const list = Array.isArray(arr) ? arr.map((v) => Number(v) || 0) : [];
      const last8 = list.length > 8 ? list.slice(-8) : list;
      return [...last8, ...new Array(Math.max(0, 8 - last8.length)).fill(0)];
    };

    const raw = (resp as any)?.data ?? resp ?? [];
    const list = Array.isArray(raw) ? raw : [];
    return list.map((cls: any) => ({
      id: String(cls?.id ?? cls?.name ?? ''),
      name: String(cls?.name ?? ''),
      students: (cls?.students || []).map((s: any) => ({
        id: String(s?.id ?? ''),
        name: String(s?.name ?? ''),
        classId: String(s?.classId ?? cls?.name ?? ''),
        cet4Scores: ensureLen8(s?.cet4Scores),
        cet6Scores: ensureLen8(s?.cet6Scores),
      })),
    }));
  }, [resp]);

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
          <Spin spinning={loading}>
            {!loading && classes.length === 0 ? (
              <Empty description={error ? '加载失败（请看控制台/Network）' : '暂无成绩数据'} />
            ) : (
              <ClassListView
                classes={classes}
                loading={loading}
                onSelectClass={handleSelectClass}
              />
            )}
          </Spin>
        )}

        {view === 'students' && selectedClass && (
          <StudentListView classData={selectedClass} onBack={handleBackToClasses} />
        )}
      </div>
    </div>
  );
}
