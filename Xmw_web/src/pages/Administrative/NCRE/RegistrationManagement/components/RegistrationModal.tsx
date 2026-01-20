import { Form, Input, Modal, Select } from 'antd';
import React, { useEffect } from 'react';

import { SaveRegistrationParams } from '@/services/administrative/ncre';

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
          rules={[{ required: true, message: '请输入学生姓名' }]}
        >
          <Input placeholder="请输入学生姓名" />
        </Form.Item>

        <Form.Item
          name="student_no"
          label="学号"
          rules={[{ required: true, message: '请输入学号' }]}
        >
          <Input placeholder="请输入学号" />
        </Form.Item>

        <Form.Item name="department" label="学院">
          <Input placeholder="请输入学院" />
        </Form.Item>

        <Form.Item name="major" label="专业">
          <Input placeholder="请输入专业" />
        </Form.Item>

        <Form.Item name="class_name" label="班级">
          <Input placeholder="请输入班级" />
        </Form.Item>

        <Form.Item name="exam_level" label="报考级别">
          <Input placeholder="例如：二级C语言、一级计算机基础" />
        </Form.Item>

        <Form.Item name="ticket_number" label="准考证号">
          <Input placeholder="请输入准考证号" />
        </Form.Item>

        <Form.Item name="campus" label="校区">
          <Select placeholder="请选择校区" allowClear>
            <Select.Option value="本部">本部</Select.Option>
            <Select.Option value="东校区">东校区</Select.Option>
            <Select.Option value="西校区">西校区</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default RegistrationModal;

