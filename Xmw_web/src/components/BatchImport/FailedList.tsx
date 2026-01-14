import type { TableProps } from 'antd';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMemo } from 'react';
import { getName } from '../../(auth)/system/staff/utils';

export enum TypeEnum {
  staff,
  student,
}

export type DataType<T> = T extends TypeEnum.staff
  ? UserWithError
  : T extends TypeEnum.student
    ? StudentPreview
    : never;

interface Props<T> {
  data: DataType<T>[];
  type?: TypeEnum;
}

const staffColumns: TableProps<UserWithError>['columns'] = [
  {
    title: '姓名',
    dataIndex: 'name',
    key: 'name',
    render: (text) => <a>{text}</a>,
  },
  { title: '手机号码', dataIndex: 'phone', key: 'phone' },
  { title: '工号', dataIndex: 'code', key: 'code' },
  {
    title: '所属部门',
    dataIndex: 'depts',
    key: 'depts',
    render: (value: Department[]) =>
      value?.map((item) => getName(item.names)).join(', ') || '-',
  },
  {
    title: '角色',
    dataIndex: 'role',
    key: 'role',
    render: (value: Role) => value?.name || '-',
  },
  {
    title: '失败原因',
    dataIndex: 'message',
    key: 'message',
    render: (value: string[]) => (
      <span className="max-w-[100px]">{value?.join(', ') || '-'}</span>
    ),
  },
];

const studentColumns: TableProps<StudentPreview>['columns'] = [
  {
    title: '姓名',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '学号',
    dataIndex: 'code',
    key: 'code',
  },
  {
    title: '班级',
    dataIndex: 'class',
    key: 'class',
  },
  {
    title: 'phone',
    dataIndex: 'phone',
    key: 'phone',
  },
  {
    title: '入学年份',
    dataIndex: 'enterYear',
    key: 'enterYear',
  },
  {
    title: '失败原因',
    dataIndex: 'message',
    key: 'message',
    render: (value: string[]) => (
      <span className="max-w-[100px]">{value?.join(', ') || '-'}</span>
    ),
  },
];

const FailedList = <T extends TypeEnum>({
  data,
  type = TypeEnum.staff,
}: Props<T>) => {
  const columns = useMemo<ColumnsType>(() => {
    return type === TypeEnum.staff ? staffColumns : studentColumns;
  }, [type]);

  return <Table<DataType<T>> columns={columns} dataSource={data} />;
};

export default FailedList;
