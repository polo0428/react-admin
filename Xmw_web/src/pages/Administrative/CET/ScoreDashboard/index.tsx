import React, { useState } from 'react';
import type { ClassScoreGroup } from './components/types';
import { MOCK_CLASSES } from './components/mockData';
import ClassListView from './components/ClassListView';
import StudentListView from './components/StudentListView';

/**
 * CET 成绩综合看板
 * - 默认展示各班级通过率/人数等汇总表格
 * - 点击班级后，进入该班级学生明细，可查看学生历次 CET-4/6 考试成绩折线
 *
 * @note 目前数据为 mock 生成，后续可替换为接口请求
 */
export default function ScoreDashboard() {
  const [view, setView] = useState<'classes' | 'students'>('classes');
  const [selectedClass, setSelectedClass] = useState<ClassScoreGroup | null>(null);

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
      <div className="max-w-[1600px] mx-auto">
        {view === 'classes' && (
          <ClassListView classes={MOCK_CLASSES} onSelectClass={handleSelectClass} />
        )}

        {view === 'students' && selectedClass && (
          <StudentListView classData={selectedClass} onBack={handleBackToClasses} />
        )}
      </div>
    </div>
  );
}
