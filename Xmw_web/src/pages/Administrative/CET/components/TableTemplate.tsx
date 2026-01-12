import { ActionType, ProColumns, ProTable } from '@ant-design/pro-components';
import { useBoolean } from 'ahooks';
import { App, Button, Form, Popconfirm, Space, Tag } from 'antd';
import { useRef } from 'react';

import { deleteCet, getCetList } from '@/services/administrative/cet';
import { isSuccess } from '@/utils';

import FormTemplate from './FormTemplate';

const TableTemplate = () => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const tableRef = useRef<ActionType>();
  const [openModal, { setTrue: setOpenModalTrue, setFalse: setOpenModalFalse }] = useBoolean(false);

  const reloadTable = () => {
    tableRef.current?.reload();
  };

  const handlerDelete = async (id: string) => {
    await deleteCet(id).then(({ code, msg }) => {
      if (isSuccess(code)) {
        message.success(msg);
        reloadTable();
      }
    });
  };

  const columns: ProColumns<API.CET>[] = [
    {
      title: '考试名称',
      dataIndex: 'title',
      ellipsis: true,
    },
    {
      title: '考试时间',
      dataIndex: 'exam_time',
      valueType: 'dateTime',
      search: false,
    },
    {
      title: '报名时间',
      dataIndex: 'registration_time',
      search: false,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Tag color="blue">起：{record.registration_start_time}</Tag>
          <Tag color="cyan">止：{record.registration_end_time}</Tag>
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueEnum: {
        0: { text: '禁用', status: 'Error' },
        1: { text: '启用', status: 'Success' },
      },
    },
    {
      title: '排序',
      dataIndex: 'sort',
      search: false,
    },
    {
      title: '创建时间',
      dataIndex: 'created_time',
      valueType: 'dateTime',
      search: false,
    },
    {
      title: '操作',
      valueType: 'option',
      render: (_, record) => [
        <a
          key="edit"
          onClick={() => {
            form.setFieldsValue(record);
            setOpenModalTrue();
          }}
        >
          编辑
        </a>,
        <Popconfirm key="delete" title="确定要删除吗？" onConfirm={() => handlerDelete(record.id!)}>
          <a style={{ color: 'red' }}>删除</a>
        </Popconfirm>,
      ],
    },
  ];

  return (
    <>
      <ProTable<API.CET>
        actionRef={tableRef}
        columns={columns}
        request={async (params) => {
          const { data } = await getCetList(params);
          return {
            data: data?.list || [],
            total: data?.total || 0,
            success: true,
          };
        }}
        rowKey="id"
        toolBarRender={() => [
          <Button
            key="create"
            type="primary"
            onClick={() => {
              form.resetFields();
              setOpenModalTrue();
            }}
          >
            新建考试
          </Button>,
        ]}
      />
      <Form form={form}>
        <FormTemplate
          reloadTable={reloadTable}
          open={openModal}
          setOpenModalFalse={setOpenModalFalse}
        />
      </Form>
    </>
  );
};

export default TableTemplate;
