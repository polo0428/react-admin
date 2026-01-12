import {
  ModalForm,
  ProFormDatePicker,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { App, Form } from 'antd';
import type { FC } from 'react';

import { createCet, updateCet } from '@/services/administrative/cet';
import { isSuccess } from '@/utils';
import { STATUS_OPTS } from '@/utils/enums';

interface FormTemplateProps {
  reloadTable: () => void;
  open: boolean;
  setOpenModalFalse: () => void;
}

const FormTemplate: FC<FormTemplateProps> = ({ reloadTable, open, setOpenModalFalse }) => {
  const { message } = App.useApp();
  const form = Form.useFormInstance();
  const { id } = form.getFieldsValue(true);

  const handlerClose = () => {
    setOpenModalFalse();
    form.resetFields();
  };

  const handlerSubmit = async (values: API.CET) => {
    const params = { ...values, id };
    await (id ? updateCet : createCet)(params).then(({ code, msg }) => {
      if (isSuccess(code)) {
        message.success(msg);
        reloadTable();
        handlerClose();
      }
    });
  };

  return (
    <ModalForm<API.CET>
      title={id ? '编辑考试' : '新建考试'}
      width={600}
      grid
      form={form}
      open={open}
      modalProps={{
        onCancel: handlerClose,
        maskClosable: false,
      }}
      onFinish={handlerSubmit}
    >
      <ProFormText
        name="title"
        label="考试名称"
        placeholder="请输入考试名称"
        colProps={{ span: 24 }}
        rules={[{ required: true, message: '请输入考试名称' }]}
      />
      <ProFormDatePicker
        name="exam_time"
        label="考试时间"
        colProps={{ span: 12 }}
        rules={[{ required: true, message: '请选择考试时间' }]}
        fieldProps={{
          style: { width: '100%' },
          showTime: true,
          format: 'YYYY-MM-DD HH:mm:ss',
        }}
      />
      <ProFormDigit
        name="sort"
        label="排序"
        colProps={{ span: 12 }}
        fieldProps={{ precision: 0 }}
      />
      <ProFormDatePicker
        name="registration_start_time"
        label="报名开始时间"
        colProps={{ span: 12 }}
        rules={[{ required: true, message: '请选择报名开始时间' }]}
        fieldProps={{
          style: { width: '100%' },
          showTime: true,
          format: 'YYYY-MM-DD HH:mm:ss',
        }}
      />
      <ProFormDatePicker
        name="registration_end_time"
        label="报名结束时间"
        colProps={{ span: 12 }}
        rules={[{ required: true, message: '请选择报名结束时间' }]}
        fieldProps={{
          style: { width: '100%' },
          showTime: true,
          format: 'YYYY-MM-DD HH:mm:ss',
        }}
      />
      <ProFormSelect
        name="status"
        label="状态"
        colProps={{ span: 12 }}
        options={STATUS_OPTS}
        rules={[{ required: true, message: '请选择状态' }]}
      />
      <ProFormTextArea
        name="description"
        label="考试说明"
        placeholder="请输入考试说明"
        colProps={{ span: 24 }}
      />
    </ModalForm>
  );
};

export default FormTemplate;
