import { Form, Input, Modal, Select } from 'antd';
import React, { useEffect } from 'react';

import { SaveRegistrationParams } from '@/services/administrative/cet';

interface RegistrationModalProps {
  open: boolean;
  initialValues?: SaveRegistrationParams | null;
  onCancel: () => void;
  onSave: (values: SaveRegistrationParams) => void;
}

const RegistrationModal: React.FC<RegistrationModalProps> = ({
  open,
  initialValues,
  onCancel,
  onSave,
}) => {
  const [form] = Form.useForm();
  const isEditing = !!initialValues?.id;

  useEffect(() => {
    if (open) {
      if (initialValues) {
        form.setFieldsValue(initialValues);
      } else {
        form.resetFields();
      }
    }
  }, [open, initialValues, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onSave({ ...initialValues, ...values });
    } catch (error) {
      console.error('Validate Failed:', error);
    }
  };

  return (
    <Modal
      title={isEditing ? '编辑报名信息' : '新增报名信息'}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      width={600}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="姓名"
          rules={[{ required: true, message: '请输入姓名' }]}
        >
          <Input placeholder="请输入姓名" />
        </Form.Item>

        <Form.Item
          name="id_card"
          label="证件号码"
          rules={[{ required: true, message: '请输入证件号码' }]}
        >
          <Input placeholder="请输入证件号码" />
        </Form.Item>

        <Form.Item name="grade" label="年级">
          <Input placeholder="例如：2025" />
        </Form.Item>

        <Form.Item name="major" label="专业">
          <Input placeholder="请输入专业" />
        </Form.Item>

        <Form.Item name="teaching_class" label="教学班">
          <Input placeholder="请输入教学班" />
        </Form.Item>

        <Form.Item name="brigade" label="学员大队">
          <Input placeholder="请输入学员大队" />
        </Form.Item>

        <Form.Item name="squadron" label="学员队">
          <Input placeholder="请输入学员队" />
        </Form.Item>

        <Form.Item name="student_type" label="学员类型">
          <Input placeholder="例如：青年生" />
        </Form.Item>

        <Form.Item name="exam_level" label="报考级别">
          <Select placeholder="请选择级别" allowClear>
            <Select.Option value="CET-4">CET-4</Select.Option>
            <Select.Option value="CET-6">CET-6</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item name="student_no" label="学号 (旧字段)">
          <Input placeholder="兼容旧数据，选填" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default RegistrationModal;

