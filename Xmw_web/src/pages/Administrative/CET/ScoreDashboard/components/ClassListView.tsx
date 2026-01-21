import { DownloadOutlined, RightOutlined } from '@ant-design/icons';
import { Button, Card, Table, Tooltip, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React from 'react';

import { downloadCSV } from '../utils/csv';
import { getMaxScore } from '../utils/score';
import { PASS_SCORE } from './constants';
import type { ClassScoreGroup } from './types';

const { Text } = Typography;

interface ClassListViewProps {
  classes: ClassScoreGroup[];
  loading?: boolean;
  groupLabel?: string;
  onSelectClass: (cls: ClassScoreGroup) => void;
}

/**
 * 班级列表视图 (双层表头表格形式)
 * 展示各班级 CET-4 / CET-6 通过率及汇总数据
 */
export default function ClassListView({
  classes,
  loading,
  groupLabel,
  onSelectClass,
}: ClassListViewProps) {
  const groupLabelText = groupLabel || '教学班';
  const formatSemester = (record: ClassScoreGroup) => {
    const year = (record.year || '').trim();
    const semester = (record.semester || '').trim();
    if (!year && !semester) return '-';
    if (year && semester) {
      // semester 可能是 “1/2”，也可能是 “上/下/第一学期”等
      return /^\d+$/.test(semester) ? `${year} 第${semester}学期` : `${year} ${semester}`;
    }
    return year || semester;
  };
  const formatCultivationLevel = (level?: number) => {
    if (level === 0) return '混合';
    if (level === 1) return '大专';
    if (level === 2) return '本科';
    if (level === 3) return '研究生';
    return '-';
  };
  const calcLevelStats = (
    students: ClassScoreGroup['students'],
    level: 'cet4Scores' | 'cet6Scores',
  ) => {
    const participants = students.filter((s) => getMaxScore(s[level]) > 0);
    const passed = participants.filter((s) => getMaxScore(s[level]) >= PASS_SCORE);
    return {
      participantsTotal: participants.length,
      passedTotal: passed.length,
      failedTotal: participants.length - passed.length,
      passRate:
        participants.length > 0 ? Math.round((passed.length / participants.length) * 100) : 0,
    };
  };

  // 单个班级导出逻辑
  const handleExportSingleClass = (e: React.MouseEvent, cls: ClassScoreGroup) => {
    e.stopPropagation();
    const headers = ['姓名,学号,CET-4最高分,CET-6最高分'];
    const rows = cls.students.map((s) =>
      [s.name, s.id, getMaxScore(s.cet4Scores) || 0, getMaxScore(s.cet6Scores) || 0].join(','),
    );
    downloadCSV([headers, ...rows].join('\n'), `${cls.name}_简要成绩单.csv`);
  };

  const columns: ColumnsType<ClassScoreGroup> = [
    {
      title: groupLabelText,
      dataIndex: 'name',
      key: 'name',
      align: 'center',
      width: 200,
      render: (text) => <span className="font-medium text-blue-600">{text}</span>,
    },
    {
      title: '学期',
      key: 'semester',
      align: 'center',
      width: 160,
      render: (_, record) => <Text type="secondary">{formatSemester(record)}</Text>,
    },
    {
      title: '年级',
      dataIndex: 'grade',
      key: 'grade',
      align: 'center',
      width: 120,
      render: (text) => <Text type="secondary">{text || '-'}</Text>,
    },
    {
      title: '培养层次',
      key: 'cultivationLevel',
      align: 'center',
      width: 120,
      render: (_, record) => (
        <Text type="secondary">{formatCultivationLevel(record.cultivationLevel)}</Text>
      ),
    },
    {
      title: '人数',
      key: 'total',
      width: 80,
      align: 'center',
      render: (_, record) => <Text code>{record.students.length}</Text>,
    },
    {
      title: 'CET-4 英语四级',
      className: 'bg-blue-50/50 text-blue-700',
      children: [
        {
          title: '通过率',
          key: 'rate4',
          align: 'center',
          width: 100,
          render: (_, record) => {
            const { passRate } = calcLevelStats(record.students, 'cet4Scores');
            return <span className="font-bold text-blue-600">{passRate}%</span>;
          },
        },
        {
          title: '通过人数',
          key: 'pass4',
          align: 'center',
          width: 100,
          render: (_, record) => {
            const { passedTotal } = calcLevelStats(record.students, 'cet4Scores');
            return <span className="text-green-600">{passedTotal}</span>;
          },
        },
        {
          title: '未通过人数',
          key: 'fail4',
          align: 'center',
          width: 100,
          render: (_, record) => {
            const { failedTotal } = calcLevelStats(record.students, 'cet4Scores');
            return <span className="text-gray-400">{failedTotal}</span>;
          },
        },
      ],
    },
    {
      title: 'CET-6 英语六级',
      className: 'bg-purple-50/50 text-purple-700',
      children: [
        {
          title: '通过率',
          key: 'rate6',
          align: 'center',
          width: 100,
          render: (_, record) => {
            const { passRate } = calcLevelStats(record.students, 'cet6Scores');
            return <span className="font-bold text-purple-600">{passRate}%</span>;
          },
        },
        {
          title: '通过人数',
          key: 'pass6',
          align: 'center',
          width: 100,
          render: (_, record) => {
            const { passedTotal } = calcLevelStats(record.students, 'cet6Scores');
            return <span className="text-green-600">{passedTotal}</span>;
          },
        },
        {
          title: '未通过人数',
          key: 'fail6',
          align: 'center',
          width: 100,
          render: (_, record) => {
            const { failedTotal } = calcLevelStats(record.students, 'cet6Scores');
            return <span className="text-gray-400">{failedTotal}</span>;
          },
        },
      ],
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <div className="flex justify-center gap-2">
          <Tooltip title="导出该班成绩">
            <Button
              type="text"
              icon={<DownloadOutlined />}
              onClick={(e) => handleExportSingleClass(e, record)}
              className="text-gray-400 hover:text-blue-600"
            />
          </Tooltip>
          <Button
            type="text"
            icon={<RightOutlined />}
            className="text-gray-400 hover:text-blue-600"
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Text type="secondary" className="mt-1 block">
            各{groupLabelText} CET-4 / CET-6 综合数据报表
          </Text>
        </div>
      </div>

      <Card bodyStyle={{ padding: 0 }} className="overflow-hidden border-gray-200">
        <Table
          dataSource={classes}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={false}
          onRow={(record) => ({
            onClick: () => onSelectClass(record),
            className: 'cursor-pointer hover:bg-slate-50 transition-colors',
          })}
          scroll={{ x: 1400 }}
          bordered
          size="middle"
        />
      </Card>
    </div>
  );
}
