import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Button, Popconfirm, Table, Tag } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import React from 'react';

import { ScoreRecord } from './types';

interface ScoreTableProps {
  dataSource: ScoreRecord[];
  loading?: boolean;
  pagination?: TablePaginationConfig;
  onDelete?: (id: string) => void;
}

/**
 * 成绩列表表格组件
 * 展示学生基本信息、考试信息、成绩详情及状态
 */
const ScoreTable: React.FC<ScoreTableProps> = ({ dataSource, loading, pagination, onDelete }) => {
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
              {record.id}
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
          <div className="text-sm text-gray-900 font-medium">
            {record.examLevel}
            {record.examSubject ? (
              <span className="text-xs text-gray-500 font-normal"> • {record.examSubject}</span>
            ) : null}
          </div>
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
            <span title="理论/选择题">理: {record.theoryScore}</span>
            <span title="操作/编程题">操: {record.practiceScore}</span>
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
      render: (_, record) => (
        <Popconfirm
          title="确定要删除这条成绩记录吗？"
          onConfirm={() => onDelete?.(record.recordId)}
          okText="确定"
          cancelText="取消"
        >
          <Button type="link" danger size="small">
            删除
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <Table
      loading={loading}
      dataSource={dataSource}
      columns={columns}
      rowKey="recordId"
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
