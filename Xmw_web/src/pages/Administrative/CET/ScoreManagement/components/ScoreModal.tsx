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
  initialValues?: any; // 支持传入初始值用于编辑
}

/**
 * 成绩录入/编辑弹窗组件
 * 支持手动录入学生信息及各项成绩，自动计算总分
 */
const ScoreModal: React.FC<ScoreModalProps> = ({
  open,
  onCancel,
  onFinish,
  batchName,
  initialValues,
}) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  // 当弹窗打开时重置表单或设置初始值
  useEffect(() => {
    if (open) {
      form.resetFields();
      if (initialValues) {
        form.setFieldsValue({
          ...initialValues,
          // 确保数值类型正确
          listeningScore: initialValues.listeningScore || 0,
          readingScore: initialValues.readingScore || 0,
          writingTranslationScore: initialValues.writingTranslationScore || 0,
          totalScore: initialValues.totalScore || 0, // 回显总分
        });
      } else {
        form.setFieldsValue({
          examLevel: ExamLevel.CET4,
          listeningScore: 0,
          readingScore: 0,
          writingTranslationScore: 0,
          totalScore: 0, // 初始总分为0
        });
      }
    }
  }, [open, initialValues, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      await onFinish({ ...values, id: initialValues?.recordId }); // 编辑时传回 id
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
          {initialValues ? '编辑成绩' : '手动录入成绩'}{' '}
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
      width={800}
      forceRender
    >
      <Form
        form={form}
        layout="vertical"
        className="mt-4"
        // onValuesChange={(changedValues, allValues) => {
        //   // 如果后续需要分项，可以在这里加联动逻辑
        // }}
      >
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
                <Input placeholder="学生姓名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="idCard" label="证件号码">
                <Input placeholder="身份证/军官证号" />
              </Form.Item>
            </Col>
            {/* 学号不再录入 */}
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="grade" label="年级">
                <Input placeholder="例如：2023" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="major" label="专业">
                <Input placeholder="例如：指挥信息系统" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="teachingClass" label="教学班">
                <Input placeholder="例如：2301班" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="brigade" label="学员大队">
                <Input placeholder="例如：学员一大队" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="squadron" label="学员队">
                <Input placeholder="例如：学员二队" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="studentType" label="学员类型">
                <Input placeholder="例如：青年学员" />
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
              <Form.Item name="examLevel" label="报考级别" rules={[{ required: true }]}>
                <Select>
                  <Option value={ExamLevel.CET4}>CET-4</Option>
                  <Option value={ExamLevel.CET6}>CET-6</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="ticketNumber" label="准考证号">
                <Input placeholder="15位准考证号（选填）" max={15} />
              </Form.Item>
            </Col>
          </Row>
        </div>

        <div>
          <Text strong className="text-xs uppercase text-gray-500 mb-2 block">
            成绩详情 (直接输入总分)
          </Text>
          {/* 隐藏分项输入框，但保留结构以防后续恢复 */}
          <div style={{ display: 'none' }}>
            <Form.Item name="listeningScore" label="听力">
              <InputNumber />
            </Form.Item>
            <Form.Item name="readingScore" label="阅读">
              <InputNumber />
            </Form.Item>
            <Form.Item name="writingTranslationScore" label="写作与翻译">
              <InputNumber />
            </Form.Item>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-end mt-2">
            <div className="flex-1 mr-8">
              <Form.Item
                name="totalScore"
                label="总分"
                rules={[{ required: true, message: '请输入总分' }]}
                style={{ marginBottom: 0 }}
              >
                <InputNumber min={0} max={710} style={{ width: '100%' }} size="large" />
              </Form.Item>
            </div>
            <Form.Item
              noStyle
              shouldUpdate={(prev, current) => prev.totalScore !== current.totalScore}
            >
              {({ getFieldValue }) => {
                const total = getFieldValue('totalScore') || 0;
                const passed = total >= 425;
                return (
                  <Tag
                    color={passed ? 'success' : 'error'}
                    className="text-base font-bold px-4 py-1.5 rounded-md mb-1"
                  >
                    {passed ? '通过' : '未通过'}
                  </Tag>
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
