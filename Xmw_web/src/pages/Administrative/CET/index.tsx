import {
  ArrowRightOutlined,
  CalendarOutlined,
  FileDoneOutlined,
  LockOutlined,
  PieChartOutlined,
  PlusOutlined,
  SettingOutlined,
  SolutionOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useRequest } from '@umijs/max';
import { App, Button, Card, Col, Row, Tag, Typography } from 'antd';
import React, { useState } from 'react';

import { deleteCet, getCetList, saveCet } from '@/services/administrative/cet';
import { navigateWithMenuParam } from '@/utils';
import { REQUEST_CODE } from '@/utils/enums';

import CreateExamModal, { ExamBatch, ExamBatchStatus } from './components/CreateExamModal';

const { Text } = Typography;
export default function ExamManagement() {
  const { message } = App.useApp();
  const [examList, setExamList] = useState<ExamBatch[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingBatchId, setEditingBatchId] = useState<string | null>(null);

  const { run: fetchBatches } = useRequest(
    async () => {
      try {
        const result = await getCetList();
        console.log('getCetList result:', result);
        if (
          result.code === REQUEST_CODE.SUCCESS &&
          result.data &&
          Array.isArray(result.data.list)
        ) {
          console.log('data.list', result.data.list);
          setExamList(result.data.list);
          return result.data.list;
        }
        return [];
      } catch (error) {
        console.error('Fetch error:', error);
        return [];
      }
    },
    {
      manual: false, // 自动执行
    },
  );

  // Navigation
  const onNavigate = (page: string, context?: any) => {
    if (page === 'scores') {
      navigateWithMenuParam('/cet/scores', { examItem: context?.examItem });
    } else if (page === 'registrations') {
      navigateWithMenuParam('/cet/registrations', { examItem: context?.examItem });
    } else if (page === 'analysis') {
      navigateWithMenuParam('/cet/analysis', { examItem: context?.examItem });
    } else if (page === 'import-reg') {
      navigateWithMenuParam('/cet/import-reg', { examItem: context?.examItem });
    } else if (page === 'import-score') {
      navigateWithMenuParam('/cet/import-score', { examItem: context?.examItem });
    } else {
      message.info(`Navigating to ${page} (Not implemented yet)`);
    }
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
          message.success('考次更新成功');
          setIsModalOpen(false);
          fetchBatches(); // 刷新列表
        }
      } else {
        const result = await saveCet(newBatchData);
        if (result.code === REQUEST_CODE.SUCCESS) {
          message.success('考次创建成功');
          setIsModalOpen(false);
          fetchBatches(); // 刷新列表
        }
      }
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  const handleDelete = async () => {
    if (editingBatchId) {
      const result = await deleteCet(editingBatchId);
      if (result.code === REQUEST_CODE.SUCCESS) {
        message.success('考次已删除');
        setIsModalOpen(false);
        fetchBatches(); // 刷新列表
      }
    }
  };

  const getInitialValues = () => {
    if (isEditing && editingBatchId) {
      return examList.find((b) => b.id === editingBatchId) || null;
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative p-6 pt-0">
      <div className="flex justify-end items-center">
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          新建考次
        </Button>
      </div>

      <div className="grid gap-6">
        {examList.map((examItem) => {
          const isPublished = examItem.status === 'published';

          return (
            <Card
              key={examItem.id}
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
                      <h3 className="text-lg font-bold text-gray-900 m-0">{examItem.name}</h3>
                      <Tag color={getStatusColor(examItem.status)}>
                        {getStatusLabel(examItem.status)}
                      </Tag>
                    </div>
                    <Text type="secondary">考试日期: {examItem.exam_date}</Text>
                  </div>
                </div>

                <Button
                  type="text"
                  icon={<SettingOutlined />}
                  onClick={() => handleEdit(examItem)}
                />
              </div>

              <Row gutter={[16, 16]} className="pt-4 border-t border-gray-100">
                <Col xs={24} md={6}>
                  <div
                    onClick={() => !isPublished && onNavigate('import-reg', { examItem })}
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
                    onClick={() => onNavigate('registrations', { examItem })}
                    className={[
                      'flex items-center justify-between p-3 rounded-lg border',
                      'border-gray-200 hover:border-blue-300 hover:bg-blue-50',
                      'group transition-all cursor-pointer',
                    ].join(' ')}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={[
                          'p-2 bg-indigo-50 text-indigo-600 rounded-md',
                          'group-hover:bg-indigo-100 transition-colors',
                        ].join(' ')}
                      >
                        <TeamOutlined />
                      </div>
                      <div className="text-left font-semibold text-gray-900">报名管理</div>
                    </div>
                    <ArrowRightOutlined className="text-gray-300 group-hover:text-blue-500" />
                  </div>
                </Col>

                <Col xs={24} md={6}>
                  <div
                    onClick={() => !isPublished && onNavigate('import-score', { examItem })}
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
                    onClick={() => onNavigate('scores', { examItem })}
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
                    onClick={() => onNavigate('analysis', { examItem })}
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
}
