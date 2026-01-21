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
  onEdit?: (record: ScoreRecord) => void;
}

/**
 * 成绩列表表格组件
 * 展示学生基本信息、考试信息、成绩详情及状态
 */
const ScoreTable: React.FC<ScoreTableProps> = ({
  dataSource,
  loading,
  pagination,
  onDelete,
  onEdit,
}) => {
  const renderCultivationLevel = (val?: number) => {
    switch (Number(val)) {
      case 1:
        return '大专';
      case 2:
        return '本科';
      case 3:
        return '研究生';
      default:
        return '-';
    }
  };

  const columns: ColumnsType<ScoreRecord> = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 100,
      render: (text) => <span className="font-medium text-gray-900">{text}</span>,
    },
    {
      title: '证件号码',
      dataIndex: 'idCard',
      key: 'idCard',
      width: 160,
      render: (text) =>
        text ? <span className="text-gray-500 font-mono text-xs">{text}</span> : '-',
    },
    {
      title: '年级',
      dataIndex: 'grade',
      key: 'grade',
      width: 80,
      render: (text) => text || '-',
    },
    {
      title: '专业',
      dataIndex: 'major',
      key: 'major',
      width: 120,
      render: (text) => text || '-',
    },
    {
      title: '培养层次',
      dataIndex: 'cultivationLevel',
      key: 'cultivationLevel',
      width: 90,
      render: (val) => renderCultivationLevel(val),
    },
    {
      title: '班级',
      key: 'classInfo',
      width: 120,
      render: (_, record) => record.teachingClass || record.classId || '-',
    },
    {
      title: '学员大队',
      dataIndex: 'brigade',
      key: 'brigade',
      width: 120,
      render: (text) => text || '-',
    },
    {
      title: '学员队',
      dataIndex: 'squadron',
      key: 'squadron',
      width: 100,
      render: (text) => text || '-',
    },
    {
      title: '总分',
      dataIndex: 'totalScore',
      key: 'totalScore',
      width: 80,
      align: 'right',
      render: (val) => <span className="font-bold text-gray-900">{val}</span>,
    },
    {
      title: '级别',
      dataIndex: 'examLevel',
      key: 'examLevel',
      width: 80,
    },
    {
      title: '状态',
      key: 'status',
      width: 80,
      render: (_, record) => (
        <Tag color={record.passed ? 'success' : 'error'}>{record.passed ? '通过' : '未通过'}</Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <div className="flex gap-2">
          <Button type="link" size="small" onClick={() => onEdit?.(record)}>
            编辑
          </Button>
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
        </div>
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
      scroll={{ x: 1600 }}
    />
  );
};

export default ScoreTable;
