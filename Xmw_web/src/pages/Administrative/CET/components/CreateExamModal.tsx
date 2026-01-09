import { DeleteOutlined } from '@ant-design/icons';
import { Button, Col, DatePicker, Form, Input, Modal, Popconfirm, Row, Select } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect } from 'react';

const { Option } = Select;

export type ExamBatchStatus = 'planning' | 'registration' | 'scoring' | 'published';

export interface ExamBatch {
  id: string;
  name: string;
  exam_date: string;
  status: ExamBatchStatus;
}

interface CreateExamModalProps {
  open: boolean;
  isEditing: boolean;
  initialValues?: ExamBatch | null;
  onCancel: () => void;
  onSave: (values: any) => void;
  onDelete?: () => void;
}

const ACADEMIC_YEARS = ['2023-2024', '2024-2025', '2025-2026', '2026-2027'];
const SEMESTERS = [
  { label: '第一学期', value: '1' },
  { label: '第二学期', value: '2' },
];

const CreateExamModal: React.FC<CreateExamModalProps> = ({
  open,
  isEditing,
  initialValues,
  onCancel,
  onSave,
  onDelete,
}) => {
  const [form] = Form.useForm();

  // Watch variables for auto-generating name
  const selectedYear = Form.useWatch('year', form);
  const selectedSemester = Form.useWatch('semester', form);

  useEffect(() => {
    if (open) {
      if (isEditing && initialValues) {
        form.setFieldsValue({
          name: initialValues.name,
          exam_date: initialValues.exam_date ? dayjs(initialValues.exam_date) : undefined,
          status: initialValues.status,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          year: ACADEMIC_YEARS[1],
          semester: '1',
          status: 'planning',
        });
      }
    }
  }, [open, isEditing, initialValues, form]);

  const generateNameAndDate = (year: string, semesterVal: string) => {
    if (!year || !semesterVal) return { name: '', defaultDate: '' };
    const semesterLabel = SEMESTERS.find((s) => s.value === semesterVal)?.label || '';
    const name = `${year}学年${semesterLabel}`;
    let defaultDate = '';
    const years = year.split('-');
    if (years.length === 2) {
      if (semesterVal === '1') {
        defaultDate = `${years[0]}-12-16`;
      } else {
        defaultDate = `${years[1]}-06-15`;
      }
    }
    return { name, defaultDate };
  };

  // Auto-fill name and date when year/semester changes in Create mode
  useEffect(() => {
    if (open && !isEditing && selectedYear && selectedSemester) {
      const { name, defaultDate } = generateNameAndDate(selectedYear, selectedSemester);
      form.setFieldsValue({
        name,
        exam_date: defaultDate ? dayjs(defaultDate) : undefined,
      });
    }
  }, [selectedYear, selectedSemester, open, isEditing, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onSave(values);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  return (
    <Modal
      title={isEditing ? '编辑考次设置' : '新建考试批次'}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      okText="保存"
      cancelText="取消"
      footer={[
        isEditing && onDelete && (
          <Popconfirm
            key="delete"
            title="确定要删除吗?"
            description="删除后所有关联数据将无法恢复"
            onConfirm={onDelete}
            okText="删除"
            cancelText="取消"
            okButtonProps={{ danger: true }}
          >
            <Button danger icon={<DeleteOutlined />} style={{ float: 'left' }}>
              删除
            </Button>
          </Popconfirm>
        ),
        <Button key="cancel" onClick={onCancel}>
          取消
        </Button>,
        <Button key="submit" type="primary" onClick={handleOk}>
          保存
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" className="mt-4">
        {!isEditing && (
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="year" label="学年">
                <Select>
                  {ACADEMIC_YEARS.map((year) => (
                    <Option key={year} value={year}>
                      {year}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="semester" label="学期">
                <Select>
                  {SEMESTERS.map((sem) => (
                    <Option key={sem.value} value={sem.value}>
                      {sem.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        )}

        <Form.Item
          name="name"
          label="考次名称"
          rules={[{ required: true, message: '请输入考次名称' }]}
        >
          <Input placeholder="自动生成或手动输入" />
        </Form.Item>

        <Form.Item
          name="exam_date"
          label="考试日期"
          rules={[{ required: true, message: '请选择考试日期' }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item name="status" label="当前状态">
          <Select>
            <Option value="planning">筹备中</Option>
            <Option value="registration">报名进行中</Option>
            <Option value="scoring">成绩录入中</Option>
            <Option value="published">已完成</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateExamModal;
