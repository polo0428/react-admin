import React from 'react';
import { BarChartOutlined, DownloadOutlined, RightOutlined } from '@ant-design/icons';
import { Button, Card, Table, Tooltip, Typography, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { ClassScoreGroup } from './types';
import { PASS_SCORE } from './constants';
import { getMaxScore } from '../utils/score';
import { downloadCSV } from '../utils/csv';
import ExportDropdown from './ExportDropdown';

const { Title, Text } = Typography;

interface ClassListViewProps {
  classes: ClassScoreGroup[];
  onSelectClass: (cls: ClassScoreGroup) => void;
}

/**
 * 班级列表视图 (双层表头表格形式)
 * 展示各班级 CET-4 / CET-6 通过率及汇总数据
 */
export default function ClassListView({ classes, onSelectClass }: ClassListViewProps) {
  // 导出全部班级的统计
  const handleExportAllStats = () => {
    const headers = [
      '班级名称,总人数,CET4通过率,CET4通过人数,CET4未过人数,CET6通过率,CET6通过人数,CET6未过人数',
    ];
    const rows = classes.map((cls) => {
      const total = cls.students.length;
      const pass4 = cls.students.filter((s) => getMaxScore(s.cet4Scores) >= PASS_SCORE).length;
      const pass6 = cls.students.filter((s) => getMaxScore(s.cet6Scores) >= PASS_SCORE).length;
      return [
        cls.name,
        total,
        `${Math.round((pass4 / total) * 100)}%`,
        pass4,
        total - pass4,
        `${Math.round((pass6 / total) * 100)}%`,
        pass6,
        total - pass6,
      ].join(',');
    });
    downloadCSV([headers, ...rows].join('\n'), '全校班级成绩统计.csv');
  };

  // 导出全部班级的明细（模拟）
  const handleExportAllDetails = () => {
    message.info('此处将导出所有班级所有学生的详细成绩 CSV');
  };

  // 单个班级导出逻辑
  const handleExportSingleClass = (e: React.MouseEvent, cls: ClassScoreGroup) => {
    e.stopPropagation();
    const headers = ['姓名,学号,CET-4最高分,CET-6最高分'];
    const rows = cls.students.map((s) =>
      [
        s.name,
        s.id,
        getMaxScore(s.cet4Scores) || 0,
        getMaxScore(s.cet6Scores) || 0,
      ].join(','),
    );
    downloadCSV([headers, ...rows].join('\n'), `${cls.name}_简要成绩单.csv`);
  };

  const columns: ColumnsType<ClassScoreGroup> = [
    {
      title: '班级名称',
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
      width: 200,
      render: (text) => <span className="font-medium text-blue-600">{text}</span>,
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
            const total = record.students.length;
            const pass = record.students.filter((s) => getMaxScore(s.cet4Scores) >= PASS_SCORE).length;
            const rate = total > 0 ? Math.round((pass / total) * 100) : 0;
            return <span className="font-bold text-blue-600">{rate}%</span>;
          },
        },
        {
          title: '通过人数',
          key: 'pass4',
          align: 'center',
          width: 100,
          render: (_, record) => {
            const pass = record.students.filter((s) => getMaxScore(s.cet4Scores) >= PASS_SCORE).length;
            return <span className="text-green-600">{pass}</span>;
          },
        },
        {
          title: '未通过人数',
          key: 'fail4',
          align: 'center',
          width: 100,
          render: (_, record) => {
            const total = record.students.length;
            const pass = record.students.filter((s) => getMaxScore(s.cet4Scores) >= PASS_SCORE).length;
            return <span className="text-gray-400">{total - pass}</span>;
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
            const total = record.students.length;
            const pass = record.students.filter((s) => getMaxScore(s.cet6Scores) >= PASS_SCORE).length;
            const rate = total > 0 ? Math.round((pass / total) * 100) : 0;
            return <span className="font-bold text-purple-600">{rate}%</span>;
          },
        },
        {
          title: '通过人数',
          key: 'pass6',
          align: 'center',
          width: 100,
          render: (_, record) => {
            const pass = record.students.filter((s) => getMaxScore(s.cet6Scores) >= PASS_SCORE).length;
            return <span className="text-green-600">{pass}</span>;
          },
        },
        {
          title: '未通过人数',
          key: 'fail6',
          align: 'center',
          width: 100,
          render: (_, record) => {
            const total = record.students.length;
            const pass = record.students.filter((s) => getMaxScore(s.cet6Scores) >= PASS_SCORE).length;
            return <span className="text-gray-400">{total - pass}</span>;
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
          <Title level={3} style={{ marginBottom: 0 }} className="flex items-center gap-2">
            <BarChartOutlined className="text-blue-600" />
            英语等级考试成绩统计
          </Title>
          <Text type="secondary" className="mt-1 block">
            各班级 CET-4 / CET-6 综合数据报表
          </Text>
        </div>

        {/* 顶部导出按钮 */}
        <ExportDropdown
          onExportDetailed={handleExportAllDetails}
          onExportStats={handleExportAllStats}
        />
      </div>

      <Card bodyStyle={{ padding: 0 }} className="overflow-hidden border-gray-200">
        <Table
          dataSource={classes}
          columns={columns}
          rowKey="id"
          pagination={false}
          onRow={(record) => ({
            onClick: () => onSelectClass(record),
            className: 'cursor-pointer hover:bg-slate-50 transition-colors',
          })}
          scroll={{ x: 1000 }}
          bordered
          size="middle"
        />
      </Card>
    </div>
  );
}
