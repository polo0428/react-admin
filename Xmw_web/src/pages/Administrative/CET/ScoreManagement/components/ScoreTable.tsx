import { LeftOutlined, MoreOutlined, RightOutlined } from '@ant-design/icons';
import { Button, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { TablePaginationConfig } from 'antd/es/table';
import React from 'react';

import { ScoreRecord } from './types';

interface ScoreTableProps {
  dataSource: ScoreRecord[];
  loading?: boolean;
  pagination?: TablePaginationConfig;
}

/**
 * 成绩列表表格组件
 * 展示学生基本信息、考试信息、成绩详情及状态
 */
const ScoreTable: React.FC<ScoreTableProps> = ({ dataSource, loading, pagination }) => {
  const columns: ColumnsType<ScoreRecord> = [
    {
      title: '学生信息',
      key: 'studentInfo',
      render: (_, record) => (
        <div className="flex items-center">
          <div
            className="h-9 w-9 rounded-full bg-indigo-100 flex items-center
           justify-center text-indigo-700 font-bold text-xs mr-3"
          >
            {record.name.substring(0, 1)}
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{record.name}</div>
            <div className="text-xs text-gray-500">
              {record.id} • {record.classId}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '考试信息',
      key: 'examInfo',
      render: (_, record) => (
        <>
          <div className="text-sm text-gray-900 font-medium">{record.examLevel}</div>
          <div className="text-xs text-gray-500">{record.examDate}</div>
        </>
      ),
    },
    {
      title: '成绩详情',
      key: 'scoreDetails',
      render: (_, record) => (
        <>
          <div className="text-sm font-bold text-gray-900">{record.totalScore}</div>
          <div className="text-xs text-gray-500 flex gap-2">
            <span title="听力">听: {record.listeningScore}</span>
            <span title="阅读">读: {record.readingScore}</span>
            <span title="写作与翻译">写译: {record.writingTranslationScore}</span>
          </div>
        </>
      ),
    },
    {
      title: '状态',
      key: 'status',
      render: (_, record) => (
        <Tag color={record.passed ? 'success' : 'error'}>{record.passed ? '通过' : '未通过'}</Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      align: 'right',
      render: () => <Button type="text" icon={<MoreOutlined />} className="text-gray-400" />,
    },
  ];

  return (
    <Table
      loading={loading}
      dataSource={dataSource}
      columns={columns}
      rowKey="ticketNumber"
      pagination={
        pagination || {
          total: dataSource.length,
          pageSize: 10,
          showTotal: (total, range) => `显示第 ${range[0]} 到 ${range[1]} 条，共 ${total} 条结果`,
          itemRender: (current, type, originalElement) => {
            if (type === 'prev') {
              return (
                <Button type="text" size="small">
                  <LeftOutlined />
                </Button>
              );
            }
            if (type === 'next') {
              return (
                <Button type="text" size="small">
                  <RightOutlined />
                </Button>
              );
            }
            return originalElement;
          },
        }
      }
    />
  );
};

export default ScoreTable;
