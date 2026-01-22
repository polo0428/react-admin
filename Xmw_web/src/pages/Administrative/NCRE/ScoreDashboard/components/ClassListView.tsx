import { Button, Card, Table, Tooltip, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React from 'react';

import { downloadCSV } from '../utils/csv';
import { getMaxScore } from '../utils/score';
import { PASS_SCORE } from './constants';
import type { GroupScore } from './types';

const { Text } = Typography;

interface ClassListViewProps {
  groups: GroupScore[];
  loading?: boolean;
  groupLabel?: string;
  onSelectGroup: (g: GroupScore) => void;
}

export default function ClassListView({
  groups,
  loading,
  groupLabel,
  onSelectGroup,
}: ClassListViewProps) {
  const groupLabelText = groupLabel || '班级';

  const formatSemester = (record: GroupScore) => {
    const year = (record.year || '').trim();
    const semester = (record.semester || '').trim();
    if (!year && !semester) return '-';
    if (year && semester) {
      return /^\d+$/.test(semester) ? `${year} 第${semester}学期` : `${year} ${semester}`;
    }
    return year || semester;
  };

  const calcStats = (students: GroupScore['students']) => {
    const participants = students.filter((s) => getMaxScore(s.scores) > 0);
    const passed = participants.filter((s) => getMaxScore(s.scores) >= PASS_SCORE);
    const avgScore =
      participants.length > 0
        ? Math.round(
            participants.reduce((sum, s) => sum + getMaxScore(s.scores), 0) / participants.length,
          )
        : 0;
    const maxScore = participants.length > 0 ? Math.max(...participants.map((s) => getMaxScore(s.scores))) : 0;
    const passRate = participants.length > 0 ? Math.round((passed.length / participants.length) * 100) : 0;
    return {
      participantsTotal: participants.length,
      passedTotal: passed.length,
      failedTotal: participants.length - passed.length,
      passRate,
      avgScore,
      maxScore,
    };
  };

  const handleExportSingle = (e: React.MouseEvent, g: GroupScore) => {
    e.stopPropagation();
    const headers = ['姓名,学号,最高分,是否通过'];
    const rows = g.students.map((s) => {
      const max = getMaxScore(s.scores);
      return [s.name, s.id, max || 0, max >= PASS_SCORE ? '通过' : '未通过'].join(',');
    });
    downloadCSV([headers, ...rows].join('\n'), `${g.name}_简要成绩单.csv`);
  };

  const columns: ColumnsType<GroupScore> = [
    {
      title: groupLabelText,
      dataIndex: 'name',
      key: 'name',
      align: 'center',
      width: 220,
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
      title: '人数',
      key: 'total',
      width: 90,
      align: 'center',
      render: (_, record) => <Text code>{record.students.length}</Text>,
    },
    {
      title: '参考人数',
      key: 'participants',
      width: 100,
      align: 'center',
      render: (_, record) => <Text code>{calcStats(record.students).participantsTotal}</Text>,
    },
    {
      title: '通过率',
      key: 'passRate',
      width: 100,
      align: 'center',
      render: (_, record) => {
        const { passRate } = calcStats(record.students);
        return <span className="font-bold text-emerald-600">{passRate}%</span>;
      },
    },
    {
      title: '通过人数',
      key: 'passed',
      width: 100,
      align: 'center',
      render: (_, record) => <span className="text-green-600">{calcStats(record.students).passedTotal}</span>,
    },
    {
      title: '未通过人数',
      key: 'failed',
      width: 110,
      align: 'center',
      render: (_, record) => <span className="text-gray-400">{calcStats(record.students).failedTotal}</span>,
    },
    {
      title: '平均分',
      key: 'avgScore',
      width: 100,
      align: 'center',
      render: (_, record) => <Text strong>{calcStats(record.students).avgScore || '-'}</Text>,
    },
    {
      title: '最高分',
      key: 'maxScore',
      width: 100,
      align: 'center',
      render: (_, record) => <Text strong>{calcStats(record.students).maxScore || '-'}</Text>,
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <div className="flex justify-center gap-2">
          <Tooltip title="导出该分组成绩">
            <Button type="link" onClick={(e) => handleExportSingle(e, record)}>
              导出
            </Button>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card bodyStyle={{ padding: 0 }} className="overflow-hidden border-gray-200">
        <Table
          dataSource={groups}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
          onRow={(record) => ({
            onClick: () => onSelectGroup(record),
            className: 'cursor-pointer hover:bg-slate-50 transition-colors',
          })}
          scroll={{ x: 1350 }}
          bordered
          size="middle"
        />
      </Card>
    </div>
  );
}


