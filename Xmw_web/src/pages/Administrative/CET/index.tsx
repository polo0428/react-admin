import {
  ArrowRightOutlined,
  CalendarOutlined,
  FileDoneOutlined,
  LockOutlined,
  PieChartOutlined,
  PlusOutlined,
  SettingOutlined,
  SolutionOutlined,
} from '@ant-design/icons';
import { App, Button, Card, Col, Row, Tag, Typography } from 'antd';
import React, { useState } from 'react';

import { saveCet } from '@/services/administrative/cet';
import { REQUEST_CODE } from '@/utils/enums';
import CreateExamModal, { ExamBatch, ExamBatchStatus } from './components/CreateExamModal';

const { Title, Text } = Typography;

// Mock data initialization
const INITIAL_BATCHES: ExamBatch[] = [
  {
    id: '1',
    name: '2023-2024学年第二学期 (2024年6月)',
    status: 'published',
    exam_date: '2024-06-15',
  },
  {
    id: '2',
    name: '2024-2025学年第一学期 (2024年12月)',
    status: 'registration',
    exam_date: '2024-12-14',
  },
];

const ExamManagement: React.FC = () => {
  const { message } = App.useApp();
  const [batches, setBatches] = useState<ExamBatch[]>(INITIAL_BATCHES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingBatchId, setEditingBatchId] = useState<string | null>(null);
  // Remove form hook as it's now in the modal component

  // Mock navigation
  const onNavigate = (page: string, context?: any) => {
    message.info(`Navigating to ${page} with context ${context?.batch?.name || ''}`);
  };

  const getStatusColor = (status: ExamBatchStatus) => {
    switch (status) {
      case 'published':
        return 'success';
      case 'scoring':
        return 'warning';
      case 'registration':
        return 'processing';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: ExamBatchStatus) => {
    switch (status) {
      case 'published':
        return '已完成';
      case 'scoring':
        return '成绩录入中';
      case 'registration':
        return '报名进行中';
      case 'planning':
        return '筹备中';
      default:
        return '未知';
    }
  };

  const handleCreate = () => {
    setIsEditing(false);
    setEditingBatchId(null);
    setIsModalOpen(true);
  };

  const handleEdit = (batch: ExamBatch) => {
    setIsEditing(true);
    setEditingBatchId(batch.id);
    setIsModalOpen(true);
  };

  const handleSave = async (values: any) => {
    try {
      const newBatchData = {
        year: values.year,
        semester: values.semester,
        name: values.name,
        exam_date: values.exam_date ? values.exam_date.format('YYYY-MM-DD') : undefined,
        status: values.status,
      };

      if (isEditing && editingBatchId) {
        const result = await saveCet({ ...newBatchData, id: editingBatchId });
        if (result.code === REQUEST_CODE.SUCCESS) {
          setBatches((prev) =>
            prev.map((b) =>
              b.id === editingBatchId ? { ...b, ...values, exam_date: newBatchData.exam_date } : b,
            ),
          );
          message.success('考次更新成功');
          setIsModalOpen(false);
        }
      } else {
        const result = await saveCet(newBatchData);
        if (result.code === REQUEST_CODE.SUCCESS) {
          const newBatch = {
            ...values,
            id: result.data.id,
            exam_date: newBatchData.exam_date,
          } as ExamBatch;
          setBatches((prev) => [newBatch, ...prev]);
          message.success('考次创建成功');
          setIsModalOpen(false);
        }
      }
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  const handleDelete = () => {
    if (editingBatchId) {
      setBatches((prev) => prev.filter((b) => b.id !== editingBatchId));
      message.success('考次已删除');
      setIsModalOpen(false);
    }
  };

  const getInitialValues = () => {
    if (isEditing && editingBatchId) {
      return batches.find((b) => b.id === editingBatchId) || null;
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative p-6">
      <div className="flex justify-between items-center">
        <div>
          <Title level={3} style={{ margin: 0 }}>
            CET考试管理
          </Title>
          <Text type="secondary">管理各学期考试批次，执行报名与成绩录入操作。</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          新建考次
        </Button>
      </div>

      <div className="grid gap-6">
        {batches.map((batch) => {
          const isPublished = batch.status === 'published';

          return (
            <Card
              key={batch.id}
              hoverable
              className="border-gray-200 shadow-sm bg-[#fff]"
              bodyStyle={{ padding: '24px' }}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-start gap-4">
                  <div
                    className={`p-3 rounded-lg hidden sm:block ${
                      isPublished ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                    }`}
                  >
                    <CalendarOutlined className="text-2xl" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-bold text-gray-900 m-0">{batch.name}</h3>
                      <Tag color={getStatusColor(batch.status)}>{getStatusLabel(batch.status)}</Tag>
                    </div>
                    <Text type="secondary">考试日期: {batch.exam_date}</Text>
                  </div>
                </div>

                <Button type="text" icon={<SettingOutlined />} onClick={() => handleEdit(batch)} />
              </div>

              <Row gutter={[16, 16]} className="pt-4 border-t border-gray-100">
                <Col xs={24} md={6}>
                  <div
                    onClick={() => !isPublished && onNavigate('import-reg', { batch })}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
                      isPublished
                        ? 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 group'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-md transition-colors ${
                          isPublished
                            ? 'bg-gray-200 text-gray-500'
                            : 'bg-blue-50 text-blue-600 group-hover:bg-blue-100'
                        }`}
                      >
                        {isPublished ? <LockOutlined /> : <FileDoneOutlined />}
                      </div>
                      <div className="text-left font-semibold text-gray-900">导入报名</div>
                    </div>
                    {!isPublished && (
                      <ArrowRightOutlined className="text-gray-300 group-hover:text-blue-500" />
                    )}
                  </div>
                </Col>

                <Col xs={24} md={6}>
                  <div
                    onClick={() => !isPublished && onNavigate('import-score', { batch })}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
                      isPublished
                        ? 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 group'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-md transition-colors ${
                          isPublished
                            ? 'bg-gray-200 text-gray-500'
                            : 'bg-green-50 text-green-600 group-hover:bg-green-100'
                        }`}
                      >
                        {isPublished ? <LockOutlined /> : <SolutionOutlined />}
                      </div>
                      <div className="text-left font-semibold text-gray-900">导入成绩</div>
                    </div>
                    {!isPublished && (
                      <ArrowRightOutlined className="text-gray-300 group-hover:text-blue-500" />
                    )}
                  </div>
                </Col>

                <Col xs={24} md={6}>
                  <div
                    onClick={() => onNavigate('scores', { batch })}
                    className="flex items-center justify-between 
                    p-3 rounded-lg border border-gray-200 hover:border-blue-300
                     hover:bg-blue-50 group transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="p-2 bg-purple-50 text-purple-600 rounded-md 
                      group-hover:bg-purple-100 transition-colors"
                      >
                        <SettingOutlined />
                      </div>
                      <div className="text-left font-semibold text-gray-900">成绩管理</div>
                    </div>
                    <ArrowRightOutlined className="text-gray-300 group-hover:text-blue-500" />
                  </div>
                </Col>

                <Col xs={24} md={6}>
                  <div
                    onClick={() => onNavigate('analysis', { batch })}
                    className="flex items-center justify-between 
                    p-3 rounded-lg border border-gray-200
                     hover:border-blue-300 hover:bg-blue-50 group transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="p-2 bg-pink-50 text-pink-600 
                      rounded-md group-hover:bg-pink-100 transition-colors"
                      >
                        <PieChartOutlined />
                      </div>
                      <div className="text-left font-semibold text-gray-900">成绩分析</div>
                    </div>
                    <ArrowRightOutlined className="text-gray-300 group-hover:text-blue-500" />
                  </div>
                </Col>
              </Row>
            </Card>
          );
        })}
      </div>

      <CreateExamModal
        open={isModalOpen}
        isEditing={isEditing}
        initialValues={getInitialValues()}
        onCancel={() => setIsModalOpen(false)}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default ExamManagement;
