import { SaveOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, InputNumber, Modal, Row, Select, Tag, Typography } from 'antd';
import React, { useEffect, useState } from 'react';

import { ExamLevel } from './types';

const { Text } = Typography;
const { Option } = Select;

interface ScoreModalProps {
  open: boolean;
  onCancel: () => void;
  onFinish: (values: any) => Promise<void> | void;
  batchName?: string;
}

/**
 * 成绩录入/编辑弹窗组件
 * 支持手动录入学生信息及各项成绩，自动计算总分
 */
const ScoreModal: React.FC<ScoreModalProps> = ({ open, onCancel, onFinish, batchName }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  // 当弹窗打开时重置表单
  useEffect(() => {
    if (open) {
      form.resetFields();
      form.setFieldsValue({
        examLevel: ExamLevel.CET4,
        listeningScore: 0,
        readingScore: 0,
        writingTranslationScore: 0,
        campus: '北校区',
      });
    }
  }, [open, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      await onFinish(values);
      setSubmitting(false);
    } catch (error) {
      console.error('Validation failed:', error);
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={
        <span>
          手动录入成绩{' '}
          {batchName && (
            <Text type="secondary" style={{ fontSize: '14px', fontWeight: 'normal' }}>
              ({batchName})
            </Text>
          )}
        </span>
      }
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          取消
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleOk}
          icon={<SaveOutlined />}
          loading={submitting}
        >
          保存成绩
        </Button>,
      ]}
      width={700}
      forceRender
    >
      <Form form={form} layout="vertical" className="mt-4">
        <div className="mb-4">
          <Text strong className="text-xs uppercase text-gray-500 mb-2 block">
            学生基本信息
          </Text>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="姓名"
                rules={[{ required: true, message: '请输入姓名' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="id" label="学号" rules={[{ required: true, message: '请输入学号' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="department" label="学院">
                <Input placeholder="例如：计算机学院" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="major" label="专业">
                <Input placeholder="例如：软件工程" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="classId" label="班级">
                <Input placeholder="例如：软工2101" />
              </Form.Item>
            </Col>
          </Row>
        </div>

        <div className="mb-4">
          <Text strong className="text-xs uppercase text-gray-500 mb-2 block">
            考试详情
          </Text>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="examLevel" label="报考级别">
                <Select>
                  <Option value={ExamLevel.CET4}>CET-4</Option>
                  <Option value={ExamLevel.CET6}>CET-6</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="ticketNumber"
                label="准考证号"
                rules={[{ required: true, message: '请输入准考证号' }]}
              >
                <Input placeholder="15位准考证号" max={15} />
              </Form.Item>
            </Col>
          </Row>
        </div>

        <div>
          <Text strong className="text-xs uppercase text-gray-500 mb-2 block">
            成绩详情
          </Text>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="listeningScore" label="听力">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="readingScore" label="阅读">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="writingTranslationScore" label="写作与翻译">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center mt-2">
            <Text type="secondary">自动计算总分</Text>
            <Form.Item
              noStyle
              shouldUpdate={(prev, current) =>
                prev.listeningScore !== current.listeningScore ||
                prev.readingScore !== current.readingScore ||
                prev.writingTranslationScore !== current.writingTranslationScore
              }
            >
              {({ getFieldValue }) => {
                const listening = getFieldValue('listeningScore') || 0;
                const reading = getFieldValue('readingScore') || 0;
                const writing = getFieldValue('writingTranslationScore') || 0;
                const total = listening + reading + writing;
                const passed = total >= 425;

                return (
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="block text-xs text-gray-500">总分</span>
                      <span className="text-2xl font-bold text-gray-900">{total}</span>
                    </div>
                    <Tag
                      color={passed ? 'success' : 'error'}
                      className="text-sm font-bold px-3 py-1 rounded-full"
                    >
                      {passed ? '通过' : '未通过'}
                    </Tag>
                  </div>
                );
              }}
            </Form.Item>
          </div>
        </div>
      </Form>
    </Modal>
  );
};

export default ScoreModal;
