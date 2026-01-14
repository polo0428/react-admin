import { IconTickCircle, IconUploadError } from '@douyinfe/semi-icons';
import { Alert, App, Button, Checkbox, Radio, Table, Typography } from 'antd';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import EditableCell from '../../EditableTable/EditableCell';
import EditableRow from '../../EditableTable/EditableRow';
import type { ColumnTypes, EditableColumnType } from '../../EditableTable/type';
import SpreadRestArea from '../../SpreadRestArea';
import Success from '../Sucess';
import { BizType } from '../type';
import {
  adminClassColumns,
  classColumns,
  classStuColumns,
  courseColumns,
  dictColumns,
  manyClassColumns,
  planColumns,
} from './columns';

type ListType = 'all' | 'error';

type SegmentedType = { label: string; value: ListType };

type ValidateResult<T> = T extends StudentPreview
  ? StudentImportResult
  : T extends StaffPreview
    ? StaffImportResult
    : T extends StudentOrgPreview
      ? StudentOrgImportResult
      : T extends CoursePreviewDTO
        ? {
            successNum: number;
            errorCount: number;
            results: CoursePreviewDTO[];
          }
        : T extends CoursePlanImportRes
          ? {
              successNum: number;
              results: CoursePlanImportRes[];
            }
          : T extends CoursePlanFieldsImportRes
            ? {
                successNum: number;
                results: CoursePlanFieldsImportRes[];
              }
            : T extends ClassImportRes
              ? {
                  successNum: number;
                  results: ClassImportRes[];
                }
              : T extends ManyClassStudentImportRes
                ? {
                    successNum: number;
                    results: ManyClassStudentImportRes[];
                  }
                : T extends ClassStudentImportRes
                  ? {
                      successNum: number;
                      results: ClassStudentImportRes[];
                    }
                  : T extends ImportCourseQuestionBankRes
                    ? {
                        successNum: number;
                        results: ImportCourseQuestionBankRes[];
                      }
                    : never;

const handleSubmitData = <
  T extends
    | StudentPreview
    | StudentOrgPreview
    | CoursePreviewDTO
    | CoursePlanImportRes
    | CoursePlanFieldsImportRes
    | ClassImportRes
    | ClassStudentImportRes
    | ManyClassStudentImportRes
    | ImportCourseQuestionBankRes,
>(
  value: T,
) => {
  // @ts-ignore
  const newValue: Record<keyof T, any> = {}; // 使用 keyof T 来获取 T 类型的所有键
  const exceptKeys: (keyof T)[] = ['pass', 'messages'];

  Object.keys(value).forEach((i) => {
    const key = i as keyof T; // 将 i 转换为 keyof T 类型
    if (!exceptKeys.includes(key)) {
      newValue[key] = value[key];
    }
  });

  return newValue;
};

interface Props<T> {
  type: BizType;
  runValidate: (data: T[]) => Promise<ValidateResult<T>>;
  saveRows: (data: T[], remindList: T[]) => Promise<ValidateResult<T>>;
  onBack: () => void;
  retry: () => void;
  dataSource: T[];
  fieldSources?: Record<string, any>;
  loading?: boolean;
  columns?: (ColumnTypes[number] & EditableColumnType<T>)[];
  multiple?: boolean;
}

const options: SegmentedType[] = [
  { label: '全部', value: 'all' },
  { label: '仅错误', value: 'error' },
];

const Preview = <
  T extends (
    | StudentPreview
    | StudentOrgPreview
    | CourseScorePreview
    | CoursePreviewDTO
    | StaffPreview
  ) & {
    id: string;
    pass: boolean;
    multiple?: boolean;
  },
>({
  type,
  runValidate,
  saveRows,
  onBack,
  retry,
  fieldSources,
  loading: loading3,
  dataSource: initDataSource,
  columns: initColumns,
  multiple = false,
}: Props<T>) => {
  const [dataSource, setDataSource] = useState<T[]>([]);
  const [errorList, setErrorList] = useState<T[]>([]);
  const [successList, setSuccessList] = useState<T[]>([]);
  const [active, setActive] = useState<ListType>('all');
  const [loading, setLoading] = useState(false);
  const [initCount, setInitCount] = useState(0);
  const [onlyTrue, setOnlyTrue] = useState(false);
  const tblRef: Parameters<typeof Table>[0]['ref'] = useRef(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const { modal, message } = App.useApp();
  const [successCount, setSuccessCount] = useState<any>(0);
  const scrollY = useMemo(() => window.screen.height - 536, []);

  useEffect(() => {
    if (initDataSource) {
      setDataSource(initDataSource);
      setInitCount(initDataSource.length);
    }
  }, [initDataSource]);

  const displayData = useMemo(() => {
    return active === 'all' ? dataSource : errorList;
  }, [active, dataSource, errorList]);

  useEffect(() => {
    setOnlyTrue(true);
    setSelectedRowKeys(
      dataSource.filter((item) => item.pass).map((item) => item.id),
    );
    const errors = dataSource.filter((item) => !item.pass);
    const successList = dataSource.filter((item) => item.pass);
    setErrorList(errors);
    setSuccessList(successList);
  }, [dataSource]);

  const handleDelete = useCallback(
    (key: string) => {
      modal.confirm({
        title: '确认删除',
        content: '确认删除该行吗？',
        okText: '确认',
        cancelText: '取消',
        centered: true,
        onOk: () => {
          const newData = dataSource.filter((item) => item.id !== key);
          setDataSource(newData);
          setInitCount((prev) => --prev);
        },
      });
    },
    [dataSource, modal],
  );

  const handleValidate = useCallback(
    (item: T) => {
      return runValidate([item]);
    },
    [runValidate],
  );
  // 构建教职工批量保存数据
  const nestCustomFields = (items: any) => {
    return items.map((item: any) => {
      const base = { ...item };
      const custom = {};
      for (const key in item) {
        if (key.startsWith('custom_field_')) {
          custom[key] = item[key];
          delete base[key];
        }
      }
      return { ...base, custom_field: custom };
    });
  };

  const handleSaveSelectedRows = () => {
    setLoading(true);
    let rows = dataSource
      .filter((item) => item.pass && selectedRowKeys.indexOf(item.id) > -1)
      .map((item) => handleSubmitData(item));

    const remindList = dataSource.filter((item) => !item.pass);
    if (type == 'staffmem' || type == 'student') {
      rows = nestCustomFields(rows);
    }

    // 确保 saveRows 调用返回 Promise
    return saveRows(rows, remindList)
      .then((res) => {
        const successNum = res?.successNum || res.data?.successNum;
        const results = res?.results || res.data?.results;
        if (successNum > 0) {
          setSuccessCount(successNum);
          setTimeout(() => {
            setSuccessCount(0);
          }, 2000);
        }
        const resList = results?.filter((item) => !item.pass) ?? [];

        // 保留未被选中的数据和保存失败的数据
        const unselectedData = dataSource.filter(
          (item) => selectedRowKeys.indexOf(item.id) === -1 && item.pass,
        );
        const newDataSource =
          unselectedData
            .concat(remindList)
            .concat(resList as T[])
            .map((item, index) => {
              return { ...item, id: item.id || index };
            }) ?? [];
        setDataSource(newDataSource);

        // 清空已选中的行
        setSelectedRowKeys([]);
      })
      .catch((error) => {
        console.error('保存失败:', error);
        throw error;
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // const handleSaveRightRows = () => {
  //   const rightRows = successList.map((item) => handleSubmitData(item));
  //   setLoading2(true);
  //   saveRows(rightRows)
  //     .then(({ successNum, results }) => {
  //       if (successNum > 0) {
  //         message.success(`成功导入${successNum}条数据`);
  //       }
  //       let newDataSource = [...dataSource];
  //       newDataSource = newDataSource.filter(
  //         (item) => rightRows.findIndex((i) => item.id === i.id) === -1,
  //       );
  //       let index = newDataSource.length;
  //       (results as T[])?.forEach((item) => {
  //         newDataSource.push({ ...item, id: index++ });
  //       });
  //       setDataSource(newDataSource);
  //     })
  //     .finally(() => {
  //       setLoading2(false);
  //     });
  // };

  const handleSave = useCallback(
    async (row: T) => {
      const newData = [...dataSource];
      const index = newData.findIndex((item) => row.id === item.id);
      const item = newData[index];
      newData.splice(index, 1, {
        ...item,
        ...row,
      });
      setDataSource(newData);
      if (type == 'student' || type == 'staffmem') {
        const customKeys = Object.keys(row)
          .filter((key: any) => key.startsWith('custom_field_'))
          .sort();
        let customField = {};
        customKeys.forEach((key) => {
          customField[key] = row[key];
          delete row[key];
        });
        row.custom_field = customField;
      }
      const { results } = await handleValidate(handleSubmitData(row));
      if (multiple && results?.length) {
        setDataSource(results);
      } else {
        const newData2 = [...newData];
        if (results?.length === 1) {
          newData2.splice(index, 1, {
            ...item,
            ...results[0],
            id: row.id,
          });
        }
        setDataSource(newData2);
      }
    },
    [dataSource, handleValidate],
  );

  const handleDeleteBatch = () => {
    if (!selectedRowKeys.length) return;
    modal.confirm({
      title: '确认删除',
      content: '确认删除所选行吗？',
      okText: '确认',
      cancelText: '取消',
      centered: true,
      onOk: () => {
        setInitCount((prev) => prev - selectedRowKeys.length);
        setSelectedRowKeys([]);
        setDataSource((prev) =>
          prev.filter((item) => selectedRowKeys.indexOf(item.id) === -1),
        );
      },
    });
  };

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const columns = useMemo(() => {
    let _columns =
      type === 'dict'
        ? dictColumns
        : type === 'course'
          ? courseColumns
          : type === 'plan'
            ? planColumns
            : type === 'class'
              ? classColumns
              : type === 'adminClass'
                ? adminClassColumns
                : type === 'manyClassStu'
                  ? manyClassColumns
                  : type === 'course-stu' && classStuColumns;
    const columns = initColumns ?? _columns;
    const renderColumn = (col: any) => {
      if (col?.dataIndex && col?.dataIndex === 'pass') {
        return {
          ...col,
          render: (text: boolean, record: T) => (
            <div className="flex items-center">
              {text ? (
                <IconTickCircle
                  style={{ color: 'var(--success)', marginRight: 2 }}
                />
              ) : (
                <>
                  <IconUploadError
                    style={{ color: 'var(--error)', marginRight: 2 }}
                  />
                  <Typography.Text
                    style={{ maxWidth: type === 'class' ? 380 : 200 }}
                    ellipsis={{ tooltip: record.messages?.join(', ') }}
                  >
                    {record.messages?.join(', ')}
                  </Typography.Text>
                </>
              )}
              {text ? '通过' : null}
            </div>
          ),
        };
      }
      if (col?.dataIndex && col.dataIndex === 'operation') {
        return {
          ...col,
          render: (_: any, record: T) => (
            <a onClick={() => handleDelete(record.id)}>删除</a>
          ),
        };
      }
      if (!col.editable) {
        return {
          ...col,
          render: (value: string | string[]) => (
            <Typography.Text
              style={{ maxWidth: 120 }}
              ellipsis={{
                tooltip: Array.isArray(value) ? value.join(', ') : value,
              }}
            >
              {Array.isArray(value) ? value.join(', ') : value}
            </Typography.Text>
          ),
        };
      }
      return {
        ...col,
        render: (value: string | string[]) => (
          <Typography.Text
            style={{ maxWidth: 120 }}
            ellipsis={{
              tooltip: Array.isArray(value) ? value.join(', ') : value,
            }}
          >
            {Array.isArray(value) ? value.join(', ') : value}
          </Typography.Text>
        ),
        onCell: (record: T) => ({
          record,
          editable: col.editable,
          dataIndex: col.dataIndex,
          title: col.message ?? col.title,
          fieldType: col.fieldType,
          fieldName: col.fieldName,
          dataSource: col.dataSource || fieldSources?.[col.dataIndex],
          selectType: col.selectType,
          required: col.required,
          rules: col.rules,
          handleSave,
          userSelectProps: col.userSelectProps,
          customRender: col.customRender,
        }),
      };
    };
    return (
      columns &&
      columns.map((col: any) => {
        if (
          col?.children &&
          Array.isArray(col.children) &&
          col.children.length > 0
        ) {
          return {
            ...col,
            children: col.children.map((child: any) => renderColumn(child)),
          };
        }
        return renderColumn(col);
      })
    );
  }, [type, fieldSources, initColumns, handleSave, handleDelete]);

  if (dataSource.length === 0 && initCount > 0) {
    return <Success type={type} count={initCount} onBack={onBack} />;
  }

  return (
    <SpreadRestArea fixHeight marginTop={32} className="mt-4">
      <div className="w-full bg-white rounded-xl  px-9 py-8 pb-4">
        <div className="mb-2">
          <Radio.Group
            value={active}
            options={options}
            onChange={(e) => setActive(e.target.value)}
          />
          {(successCount > 0 || errorList.length > 0) && (
            <div className="flex justify-center -mt-[22px]">
              {successCount > 0 ? (
                <Alert
                  showIcon
                  type="success"
                  message={`成功导入${successCount}条数据`}
                />
              ) : errorList.length > 0 ? (
                <Alert
                  showIcon
                  type="error"
                  message={`当前表格存在${errorList.length}条错误，请在当前页修改后再导入。`}
                />
              ) : null}
            </div>
          )}
        </div>
        <Table
          rowSelection={{
            type: 'checkbox',
            columnWidth: 40,
            onChange: (selectedRowKeys) => {
              setSelectedRowKeys(selectedRowKeys as string[]);
            },
            selectedRowKeys,
          }}
          className="importTable"
          rowKey="id"
          // virtual
          components={components}
          dataSource={displayData}
          ref={tblRef}
          columns={columns as ColumnTypes}
          scroll={
            displayData.length > 0
              ? {
                  x: 'max-content',
                  y: scrollY,
                }
              : { x: 'max-content', y: 200 }
          }
          pagination={{
            size: 'small',
            showQuickJumper: true,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100', '200', '500'],
            showTotal: (total, range) =>
              `第 ${range[0]}-${range[1]} 条 / 共 ${total} 条`,
          }}
        />
      </div>
      <div className="mt-8 pb-8 px-15 flex justify-between">
        <div className="flex gap-4 items-center">
          <Checkbox
            onChange={(e) => {
              const val = e.target.checked;
              if (val) {
                setSelectedRowKeys(
                  dataSource.filter((item) => item.pass).map((item) => item.id),
                );
              }
              setOnlyTrue(val);
            }}
            checked={onlyTrue}
          >
            仅正确
          </Checkbox>
          <span className="text-weak50">已选 {selectedRowKeys.length} 条</span>
        </div>
        <div>
          <div className="flex gap-4">
            <Button onClick={retry}>重新上传</Button>
            <Button danger onClick={handleDeleteBatch}>
              删除
            </Button>
            <Button
              type="primary"
              loading={loading}
              onClick={handleSaveSelectedRows}
              disabled={
                selectedRowKeys.length === 0 ||
                (errorList.length > 0 && successList.length == 0)
              }
            >
              导入数据
            </Button>
          </div>
        </div>
      </div>
    </SpreadRestArea>
  );
};

export default Preview;
