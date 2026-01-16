import { SaveOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, InputNumber, Modal, Row, Select, Tag, Typography } from 'antd';
import React, { useEffect, useState } from 'react';

import { ExamLevel } from './types';

const { Text } = Typography;
const { Option } = Select;

const PASS_SCORE = 60;

const SUBJECTS_BY_LEVEL: Record<ExamLevel, string[]> = {
  [ExamLevel.NCRE1]: [
    '计算机基础及MS Office应用',
    '计算机基础及WPS Office应用',
    '计算机基础及Photoshop应用',
    '网络安全素质教育',
  ],
  [ExamLevel.NCRE2]: [
    'C语言程序设计',
    'Java语言程序设计',
    'Python语言程序设计',
    'C++语言程序设计',
    'Web程序设计',
    'MS Office高级应用与设计',
  ],
  [ExamLevel.NCRE3]: ['网络技术', '数据库技术', '信息安全技术', '嵌入式系统开发技术'],
  [ExamLevel.NCRE4]: ['网络工程师', '数据库工程师', '信息安全工程师', '嵌入式系统开发工程师'],
};

const encodeExamLevel = (level: string, subject?: string) =>
  subject ? `${level}|${subject}` : level;

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
  const examLevel = Form.useWatch('examLevel', form) as ExamLevel | undefined;

  // 当弹窗打开时重置表单
  useEffect(() => {
    if (open) {
      form.resetFields();
      const defaultLevel = ExamLevel.NCRE2;
      const defaultSubject = SUBJECTS_BY_LEVEL[defaultLevel]?.[0];
      form.setFieldsValue({
        examLevel: defaultLevel,
        examSubject: defaultSubject,
        theoryScore: 0,
        practiceScore: 0,
      });
    }
  }, [open, form]);

  // 级别变化时，动态调整科目（保持科目在可选项内）
  useEffect(() => {
    if (!open || !examLevel) return;
    const options = SUBJECTS_BY_LEVEL[examLevel] || [];
    if (options.length === 0) return;
    const cur = form.getFieldValue('examSubject');
    if (!cur || !options.includes(cur)) {
      form.setFieldsValue({ examSubject: options[0] });
    }
  }, [open, examLevel, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        // 兼容后端现有字段：把“级别|科目”编码进 examLevel
        examLevel: encodeExamLevel(values.examLevel, values.examSubject),
      };
      setSubmitting(true);
      await onFinish(payload);
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
            <Col span={12}>
              <Form.Item name="department" label="学院">
                <Input placeholder="例如：计算机学院" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="major" label="专业">
                <Input placeholder="例如：软件工程" />
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
              <Form.Item
                name="examLevel"
                label="报考级别"
                rules={[{ required: true, message: '请选择报考级别' }]}
              >
                <Select>
                  <Option value={ExamLevel.NCRE1}>计算机一级</Option>
                  <Option value={ExamLevel.NCRE2}>计算机二级</Option>
                  <Option value={ExamLevel.NCRE3}>计算机三级</Option>
                  <Option value={ExamLevel.NCRE4}>计算机四级</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="examSubject"
                label="考试科目"
                rules={[{ required: true, message: '请选择考试科目' }]}
              >
                <Select placeholder="请选择考试科目" disabled={!examLevel}>
                  {(examLevel ? SUBJECTS_BY_LEVEL[examLevel] : []).map((s) => (
                    <Option key={s} value={s}>
                      {s}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="ticketNumber"
                label="准考证号"
                rules={[
                  { required: true, message: '请输入准考证号' },
                  { pattern: /^\d{15}$/, message: '准考证号应为15位数字' },
                ]}
              >
                <Input placeholder="15位准考证号" maxLength={15} />
              </Form.Item>
            </Col>
          </Row>
        </div>

        <div>
          <Text strong className="text-xs uppercase text-gray-500 mb-2 block">
            成绩详情
          </Text>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="theoryScore" label="理论/选择题">
                <InputNumber min={0} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="practiceScore" label="操作/编程题">
                <InputNumber min={0} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center mt-2">
            <Text type="secondary">自动计算总分</Text>
            <Form.Item
              noStyle
              shouldUpdate={(prev, current) =>
                prev.theoryScore !== current.theoryScore ||
                prev.practiceScore !== current.practiceScore
              }
            >
              {({ getFieldValue }) => {
                const theory = getFieldValue('theoryScore') || 0;
                const practice = getFieldValue('practiceScore') || 0;
                const total = theory + practice;
                const passed = total >= PASS_SCORE;
                const gradeText = passed ? '及格' : '不及格';

                return (
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="block text-xs text-gray-500">总分 / 等级</span>
                      <div className="flex items-baseline justify-end gap-2">
                        <span className="text-2xl font-bold text-gray-900">{total}</span>
                        <span className="text-sm text-gray-500">{gradeText}</span>
                      </div>
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
