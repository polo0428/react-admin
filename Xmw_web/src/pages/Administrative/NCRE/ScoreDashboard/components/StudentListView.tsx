import { ArrowLeftOutlined, HistoryOutlined } from '@ant-design/icons';
import { Button, Card, Divider, Input, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useMemo, useState } from 'react';

import { downloadCSV } from '../utils/csv';
import { getMaxScore } from '../utils/score';
import { PASS_SCORE } from './constants';
import type { GroupScore, StudentScore } from './types';

const { Title, Text } = Typography;
const { Search } = Input;

interface StudentListViewProps {
  groupData: GroupScore;
  groupLabel?: string;
  onBack: () => void;
}

export default function StudentListView({ groupData, groupLabel, onBack }: StudentListViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const groupLabelText = groupLabel || '班级';

  const filteredStudents = useMemo(() => {
    return groupData.students.filter((s) => s.name.includes(searchTerm) || s.id.includes(searchTerm));
  }, [groupData.students, searchTerm]);

  const handleExportDetailed = () => {
    const header = ['姓名', '学号', '最高分', '是否通过', ...Array(8).fill(0).map((_, i) => `第${i + 1}次`)];
    const rows = filteredStudents.map((s) => {
      const max = getMaxScore(s.scores);
      const last8 = (s.scores || []).slice(-8);
      const padded = [...new Array(Math.max(0, 8 - last8.length)).fill(0), ...last8];
      return [s.name, s.id, max || 0, max >= PASS_SCORE ? '通过' : '未通过', ...padded].join(',');
    });
    downloadCSV([header.join(','), ...rows].join('\n'), `${groupLabelText}_${groupData.name}_详细成绩表.csv`);
  };

  const renderStatus = (score: number) => {
    if (!score || score === 0) return <Text type="secondary">-</Text>;
    return score >= PASS_SCORE ? <Tag color="success">通过</Tag> : <Tag color="error">未通过</Tag>;
  };

  const expandedRowRender = (record: StudentScore) => {
    const last8 = (record.scores || []).slice(-8);
    const padded = [...new Array(Math.max(0, 8 - last8.length)).fill(0), ...last8];
    const max = getMaxScore(record.scores);

    return (
      <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
        <div className="flex items-center gap-2 mb-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <HistoryOutlined /> 历史考试记录明细
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-4 py-2 w-20 text-left text-xs font-normal text-slate-400">考次</th>
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
              <tr>
                <td className="px-4 py-3 text-xs font-bold text-blue-600 bg-blue-50/10">总分</td>
                {padded.map((score, i) => {
                  const hasScore = Number(score) > 0;
                  const isMax = hasScore && Number(score) === max && max > 0;
                  const passed = Number(score) >= PASS_SCORE;
                  return (
                    <td key={i} className="px-2 py-3 text-center border-r border-slate-50 last:border-0">
                      {!hasScore ? (
                        <span className="text-gray-300 text-xs">-</span>
                      ) : (
                        <div className="flex items-center gap-1.5 justify-center flex-col">
                          <span className={`text-xs font-mono font-medium ${passed ? 'text-gray-700' : 'text-gray-400'}`}>
                            {Number(score)}
                          </span>
                          {isMax && <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" title="最高分" />}
                        </div>
                      )}
                    </td>
                  );
                })}
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
      width: 140,
      render: (text) => <span className="font-medium text-gray-900">{text}</span>,
    },
    {
      title: '学号',
      dataIndex: 'id',
      key: 'id',
      width: 140,
      render: (text) => (
        <Text type="secondary" code>
          {text}
        </Text>
      ),
    },
    {
      title: '通过情况',
      key: 'status',
      align: 'center',
      width: 120,
      render: (_, record) => renderStatus(getMaxScore(record.scores)),
    },
    {
      title: '最高分',
      key: 'maxScore',
      align: 'center',
      width: 120,
      render: (_, record) => {
        const max = getMaxScore(record.scores);
        return max > 0 ? <Text strong>{max}</Text> : <Text type="secondary">-</Text>;
      },
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button type="link" onClick={onBack} icon={<ArrowLeftOutlined />} className="p-0 text-slate-500 hover:text-blue-600">
            返回
          </Button>
          <Divider type="vertical" className="hidden xl:block h-6 bg-slate-200" />
          <Title level={4} style={{ margin: 0 }} className="hidden md:block">
            {groupLabelText}：{groupData.name}
          </Title>
          <Search
            placeholder="搜姓名/学号"
            onSearch={setSearchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: 200 }}
            allowClear
          />
        </div>

        <Button onClick={handleExportDetailed}>导出明细</Button>
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
          scroll={{ x: 700 }}
          size="middle"
          bordered
        />
      </Card>
    </div>
  );
}


