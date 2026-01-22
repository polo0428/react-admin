import { LeftOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useLocation, useRequest } from '@umijs/max';
import {
  Button,
  Card,
  Input,
  message,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import React, { useCallback, useMemo, useState } from 'react';

import {
  deleteRegistration,
  getRegistrationList,
  saveRegistration,
  SaveRegistrationParams,
} from '@/services/administrative/ncre';
import { navigateWithMenuParam } from '@/utils';
import { REQUEST_CODE } from '@/utils/enums';

import { ExamBatch } from '../components/CreateExamModal';
import RegistrationModal from './components/RegistrationModal';

const { Title } = Typography;
const { Option } = Select;

type RegistrationRecord = {
  recordId: string;
  name: string;
  studentNo: string;
  department: string;
  major: string;
  className: string;
  examLevel: string;
  ticketNumber: string;
  campus: string;
};

const mapRow = (item: any): RegistrationRecord => ({
  recordId: item.id,
  name: item.name,
  studentNo: item.student_no || item.studentNo,
  department: item.department || '',
  major: item.major || '',
  className: item.class_name || item.className || '',
  examLevel: item.exam_level || item.examLevel || '',
  ticketNumber: item.ticket_number || item.ticketNumber || '',
  campus: item.campus || '',
});

export default function RegistrationManagement() {
  const location = useLocation();
  const state = location.state as { examItem?: ExamBatch } | undefined;
  const batch = state?.examItem;

  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [dataSource, setDataSource] = useState<RegistrationRecord[]>([]);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<SaveRegistrationParams | null>(null);

  const {
    loading,
    refresh,
    run: fetchList,
  } = useRequest(
    async (params) => {
      if (!batch?.id) return { list: [], total: 0 };
      const res = await getRegistrationList({
        batch_id: batch.id,
        current: params?.current || current,
        pageSize: params?.pageSize || pageSize,
        keyword: searchTerm,
        exam_level: levelFilter === 'all' ? undefined : levelFilter,
      });
      const raw = res as any;
      const responseData = raw?.data || raw || {};
      const list = Array.isArray(responseData.list) ? responseData.list : [];
      const mapped = list.map(mapRow);
      setDataSource(mapped);
      setTotalCount(responseData.total || 0);
      return { list: mapped, total: responseData.total || 0 };
    },
    {
      refreshDeps: [batch?.id],
      debounceInterval: 300,
    },
  );

  React.useEffect(() => {
    setCurrent(1);
    fetchList({ current: 1, pageSize });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, levelFilter]);

  const handleBack = () => {
    navigateWithMenuParam('/ncre/list');
  };

  const handleCreate = () => {
    setEditingRecord(null);
    setIsModalOpen(true);
  };

  const handleEdit = (record: RegistrationRecord) => {
    setEditingRecord({
      id: record.recordId,
      batch_id: batch?.id || '',
      name: record.name,
      student_no: record.studentNo,
      department: record.department,
      major: record.major,
      class_name: record.className,
      exam_level: record.examLevel,
      ticket_number: record.ticketNumber,
      campus: record.campus,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (values: SaveRegistrationParams) => {
    if (!batch?.id) return;
    try {
      const res = await saveRegistration({ ...values, batch_id: batch.id });
      if (res.code === REQUEST_CODE.SUCCESS) {
        message.success(editingRecord ? '更新成功' : '创建成功');
        setIsModalOpen(false);
        refresh();
      }
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  const handleDelete = useCallback(
    async (recordId: string) => {
      try {
        await deleteRegistration(recordId);
        message.success('删除成功');
        refresh();
      } catch (error) {
        console.error('Delete failed:', error);
      }
    },
    [refresh],
  );

  const columns = useMemo(
    () => [
      { title: '姓名', dataIndex: 'name', key: 'name' },
      { title: '学号', dataIndex: 'studentNo', key: 'studentNo' },
      { title: '学院', dataIndex: 'department', key: 'department' },
      { title: '专业', dataIndex: 'major', key: 'major' },
      { title: '班级', dataIndex: 'className', key: 'className' },
      {
        title: '报考级别',
        dataIndex: 'examLevel',
        key: 'examLevel',
        render: (val: string) => (val ? <Tag color="geekblue">{val}</Tag> : '-'),
      },
      {
        title: '操作',
        key: 'action',
        render: (_: any, record: RegistrationRecord) => (
          <Space>
            <Button type="link" size="small" onClick={() => handleEdit(record)}>
              编辑
            </Button>
            <Popconfirm
              title="确定要删除这条记录吗？"
              onConfirm={() => handleDelete?.(record.recordId)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link" danger size="small">
                删除
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [handleDelete],
  );

  return (
    <div className="space-y-6 p-6 pt-0 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4">
        <Button
          type="link"
          onClick={handleBack}
          icon={<LeftOutlined />}
          style={{ padding: 0, width: 'fit-content' }}
        >
          返回考次列表
        </Button>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <Title level={3} style={{ margin: 0 }}>
                报名管理
              </Title>
              {batch && <Tag color="geekblue">{batch.name}</Tag>}
            </div>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新增报名
          </Button>
        </div>
      </div>

      <Card bodyStyle={{ padding: 0 }} className="overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between bg-gray-50/50">
          <Input
            prefix={<SearchOutlined className="text-gray-400" />}
            placeholder="搜索学生姓名或学号..."
            style={{ maxWidth: 300 }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            allowClear
          />

          <Space>
            <Select
              defaultValue="all"
              value={levelFilter}
              onChange={setLevelFilter}
              style={{ width: 120 }}
            >
              <Option value="all">所有级别</Option>
              <Option value="一级">一级</Option>
              <Option value="二级">二级</Option>
              <Option value="三级">三级</Option>
              <Option value="四级">四级</Option>
            </Select>
          </Space>
        </div>

        <Table
          rowKey="recordId"
          loading={loading}
          dataSource={dataSource}
          columns={columns as any}
          scroll={{ x: 'max-content' }}
          pagination={{
            total: totalCount || 0,
            current,
            pageSize,
            onChange: (page, size) => {
              setCurrent(page);
              setPageSize(size);
              fetchList({ current: page, pageSize: size });
            },
            showTotal: (total, range) => `显示第 ${range[0]} 到 ${range[1]} 条，共 ${total} 条结果`,
          }}
        />
      </Card>

      <RegistrationModal
        open={isModalOpen}
        initialValues={editingRecord}
        onCancel={() => setIsModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}
