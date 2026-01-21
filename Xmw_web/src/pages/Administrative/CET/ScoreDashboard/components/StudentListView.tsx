import React, { useState } from 'react';
import {
  ArrowLeftOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import { Button, Card, Input, Table, Tag, Typography, Divider } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { ClassScoreGroup, StudentScore } from './types';
import { PASS_SCORE } from './constants';
import { getMaxScore } from '../utils/score';
import { downloadCSV } from '../utils/csv';
import ExportDropdown from './ExportDropdown';

const { Title, Text } = Typography;
const { Search } = Input;

interface StudentListViewProps {
  classData: ClassScoreGroup;
  groupLabel?: string;
  onBack: () => void;
}

/**
 * 学生列表视图 (双层表头 + 展开详情)
 * 展示某班级全部学生的 CET4/CET6 最高分和通过状态，可展开查看历次成绩
 */
export default function StudentListView({
  classData,
  groupLabel,
  onBack,
}: StudentListViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const groupLabelText = groupLabel || '教学班';

  const filteredStudents = classData.students.filter(
    (s) => s.name.includes(searchTerm) || s.id.includes(searchTerm),
  );

  // 导出该班级所有详细数据
  const handleExportDetailed = () => {
    const headers = ['姓名', '学号', 'CET-4最高分', 'CET-6最高分'];
    for (let i = 1; i <= 8; i++) headers.push(`CET4-第${i}次`, `CET6-第${i}次`);

    const rows = filteredStudents.map((s) => {
      const s4Max = getMaxScore(s.cet4Scores);
      const s6Max = getMaxScore(s.cet6Scores);
      const basicInfo = [s.name, s.id, s4Max || 0, s6Max || 0];
      const details: (number | string)[] = [];
      for (let i = 0; i < 8; i++) {
        details.push(s.cet4Scores[i] || 0);
        details.push(s.cet6Scores[i] || 0);
      }
      return [...basicInfo, ...details].join(',');
    });
    downloadCSV(
      [headers.join(','), ...rows].join('\n'),
      `${groupLabelText}_${classData.name}_详细成绩表.csv`,
    );
  };

  // 导出该班级统计
  const handleExportStats = () => {
    const headers = ['姓名,学号,CET-4最高分,CET-4状态,CET-6最高分,CET-6状态'];
    const rows = filteredStudents.map((s) => {
      const s4 = getMaxScore(s.cet4Scores);
      const s6 = getMaxScore(s.cet6Scores);
      return [
        s.name,
        s.id,
        s4 > 0 ? s4 : '无成绩',
        s4 >= PASS_SCORE ? '通过' : '未通过',
        s6 > 0 ? s6 : '无成绩',
        s6 >= PASS_SCORE ? '通过' : '未通过',
      ].join(',');
    });
    downloadCSV(
      [headers, ...rows].join('\n'),
      `${groupLabelText}_${classData.name}_统计表.csv`,
    );
  };

  const renderStatus = (score: number) => {
    if (!score || score === 0) return <Text type="secondary">-</Text>;
    return score >= PASS_SCORE ? (
      <Tag color="success">通过</Tag>
    ) : (
      <Tag color="error">未通过</Tag>
    );
  };

  const renderScore = (score: number) => {
    if (!score || score === 0) return <Text type="secondary">-</Text>;
    return (
      <Text strong className={score >= PASS_SCORE ? 'text-gray-900' : 'text-gray-400'}>
        {score}
      </Text>
    );
  };

  const renderHistoryCell = (score: number, isMax: boolean) => {
    const hasScore = score > 0;
    const isPassed = score >= PASS_SCORE;
    if (!hasScore) return <span className="text-gray-300 text-xs">-</span>;
    return (
      <div className="flex items-center gap-1.5 justify-center flex-col">
        <span
          className={`text-xs font-mono font-medium ${isPassed ? 'text-gray-700' : 'text-gray-400'}`}
        >
          {score}
        </span>
        {isMax && <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" title="最高分" />}
      </div>
    );
  };

  const expandedRowRender = (record: StudentScore) => {
    const s4 = getMaxScore(record.cet4Scores);
    const s6 = getMaxScore(record.cet6Scores);

    return (
      <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
        <div className="flex items-center gap-2 mb-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <HistoryOutlined /> 历史考试记录明细
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-4 py-2 w-20 text-left text-xs font-normal text-slate-400">
                  考次
                </th>
                {Array(8)
                  .fill(0)
                  .map((_, i) => (
                    <th key={i} className="px-2 py-2 text-center text-xs font-normal text-slate-400">
                      第{i + 1}次
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody className="bg-white">
              <tr className="border-b border-slate-100">
                <td className="px-4 py-3 text-xs font-bold text-blue-600 bg-blue-50/10">CET-4</td>
                {record.cet4Scores.map((score, i) => (
                  <td key={i} className="px-2 py-3 text-center border-r border-slate-50 last:border-0">
                    {renderHistoryCell(score, score === s4 && s4 > 0)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-4 py-3 text-xs font-bold text-purple-600 bg-purple-50/10">CET-6</td>
                {record.cet6Scores.map((score, i) => (
                  <td key={i} className="px-2 py-3 text-center border-r border-slate-50 last:border-0">
                    {renderHistoryCell(score, score === s6 && s6 > 0)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const columns: ColumnsType<StudentScore> = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
      width: 120,
      render: (text) => <span className="font-medium text-gray-900">{text}</span>,
    },
    {
      title: '学号',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      render: (text) => <Text type="secondary" code>{text}</Text>,
    },
    {
      title: 'CET-4 英语四级',
      className: 'bg-blue-50/30',
      children: [
        {
          title: '通过情况',
          key: 'status4',
          align: 'center',
          width: 100,
          render: (_, record) => renderStatus(getMaxScore(record.cet4Scores)),
        },
        {
          title: '最高分',
          key: 'score4',
          align: 'center',
          width: 100,
          render: (_, record) => renderScore(getMaxScore(record.cet4Scores)),
        },
      ],
    },
    {
      title: 'CET-6 英语六级',
      className: 'bg-purple-50/30',
      children: [
        {
          title: '通过情况',
          key: 'status6',
          align: 'center',
          width: 100,
          render: (_, record) => renderStatus(getMaxScore(record.cet6Scores)),
        },
        {
          title: '最高分',
          key: 'score6',
          align: 'center',
          width: 100,
          render: (_, record) => renderScore(getMaxScore(record.cet6Scores)),
        },
      ],
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      {/* 顶部栏 */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button type="link" onClick={onBack} icon={<ArrowLeftOutlined />} className="p-0 text-slate-500 hover:text-blue-600">
            返回
          </Button>
          <Divider type="vertical" className="hidden xl:block h-6 bg-slate-200" />
          <Title level={4} style={{ margin: 0 }} className="hidden md:block">
            {groupLabelText}：{classData.name}
          </Title>

          <Search
            placeholder="搜姓名/学号"
            onSearch={setSearchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: 200 }}
            allowClear
          />
        </div>

        {/* 顶部导出按钮 */}
        <ExportDropdown
          onExportDetailed={handleExportDetailed}
          onExportStats={handleExportStats}
        />
      </div>

      <Card bodyStyle={{ padding: 0 }} className="overflow-hidden border-gray-200">
        <Table
          dataSource={filteredStudents}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          expandable={{
            expandedRowRender,
            expandRowByClick: true,
          }}
          scroll={{ x: 800 }}
          size="middle"
          bordered
        />
      </Card>
    </div>
  );
}
