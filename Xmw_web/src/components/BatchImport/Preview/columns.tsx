import { validatePhone } from '@/app/utils/helper';
import { ColumnTypes, EditableColumnType } from '../../EditableTable/type';

export const dictColumns: (ColumnTypes[number] &
  EditableColumnType<StudentOrgPreview>)[] = [
  {
    title: '一级部门',
    dataIndex: 'firstDept',
    editable: true,
    rules: [{ max: 35, message: '部门名称不能超过35个字符 ' }],
    width: 150,
  },
  {
    title: '二级部门',
    dataIndex: 'secondDept',
    editable: true,
    required: false,
    rules: [{ max: 35, message: '部门名称不能超过35个字符 ' }],
    width: 150,
  },
  {
    title: '三级部门',
    dataIndex: 'thirdDept',
    editable: true,
    required: false,
    rules: [{ max: 35, message: '部门名称不能超过35个字符 ' }],
    width: 150,
  },
  {
    title: '四级部门',
    dataIndex: 'fourthDept',
    editable: true,
    required: false,
    rules: [{ max: 35, message: '部门名称不能超过35个字符 ' }],
    width: 150,
  },
  {
    title: '五级部门',
    dataIndex: 'fifthDept',
    editable: true,
    required: false,
    rules: [{ max: 35, message: '部门名称不能超过35个字符 ' }],
    width: 150,
  },
  {
    title: '六级部门',
    dataIndex: 'sixthDept',
    editable: true,
    required: false,
    rules: [{ max: 35, message: '部门名称不能超过35个字符 ' }],
    width: 150,
  },
  {
    title: '七级部门',
    dataIndex: 'seventhDept',
    editable: true,
    required: false,
    rules: [{ max: 35, message: '部门名称不能超过35个字符 ' }],
    width: 150,
  },
  {
    title: '八级部门',
    dataIndex: 'eighthDept',
    editable: true,
    required: false,
    rules: [{ max: 35, message: '部门名称不能超过35个字符 ' }],
    width: 150,
  },
  {
    title: '班级',
    dataIndex: 'className',
    editable: true,
    rules: [{ max: 35, message: '班级名称不能超过35个字符 ' }],
    width: 150,
  },
  {
    title: '入学年级',
    dataIndex: 'year',
    editable: true,
    fieldType: 'yearPicker',
  },
  // {
  //   title: '错误原因',
  //   dataIndex: 'messages',
  //   fixed: 'right',
  //   width: 150,
  // },
  {
    title: '校验情况',
    dataIndex: 'pass',
    fixed: 'right',
    width: 100,
    align: 'center',
  },
  {
    title: '操作',
    dataIndex: 'operation',
    fixed: 'right',
    align: 'center',
    width: 80,
  },
];

export const studentColumns: (ColumnTypes[number] &
  EditableColumnType<StudentPreview>)[] = [
  {
    title: '姓名',
    dataIndex: 'name',
    editable: true,
    rules: [{ max: 30, message: '学生姓名不能超过30个字符 ' }],
  },
  {
    title: '学号',
    dataIndex: 'code',
    editable: true,
  },
  {
    title: '班级',
    dataIndex: 'chainName',
    editable: true,
    fieldType: 'select',
    fieldName: 'classId',
  },
  {
    title: '手机号',
    dataIndex: 'phone',
    editable: true,
    required: false,
    rules: [{ validator: validatePhone }],
  },
  {
    title: '入学年级',
    dataIndex: 'year',
    editable: true,
    fieldType: 'yearPicker',
    required: false,
  },
  // {
  //   title: '错误原因',
  //   dataIndex: 'messages',
  //   fixed: 'right',
  //   width: 150,
  // },
  {
    title: '校验情况',
    dataIndex: 'pass',
    fixed: 'right',
    align: 'center',
    width: 100,
  },
  {
    title: '操作',
    dataIndex: 'operation',
    fixed: 'right',
    align: 'center',
    width: 80,
  },
];

export const courseColumns: (ColumnTypes[number] &
  EditableColumnType<CoursePreviewDTO>)[] = [
  {
    title: '课程名称',
    dataIndex: 'courseName',
    editable: true,
    required: true,
    rules: [{ max: 35, message: '课程名称不能超过35个字符' }],
  },
  {
    title: '课程编号',
    dataIndex: 'courseCode',
    editable: true,
    required: true,
    rules: [
      { max: 35, message: '课程编号不能超过35个字符' },
      {
        validator: (_, value) => {
          // 只能数字字母组成
          if (value && !/^[a-zA-Z0-9]+$/.test(value)) {
            return Promise.reject(new Error('只能包含数字、字母'));
          }
          return Promise.resolve();
        },
      },
    ],
  },
  {
    title: '开课单位',
    dataIndex: 'offeringDepartmentName',
    fieldName: 'offeringDepartmentId',
    fieldType: 'select',
    editable: true,
    required: true,
  },
  {
    title: '培养层次',
    dataIndex: 'cultivationLevel',
    fieldType: 'select',
    fieldName: 'cultivationLevel',
    editable: true,
    required: false,
  },
  {
    title: '考核方式',
    dataIndex: 'assessMethodStr',
    fieldType: 'select',
    editable: true,
    required: true,
    fieldName: 'assessMethod',
  },
  {
    title: '课程属性',
    dataIndex: 'requireTypeStr',
    fieldType: 'select',
    fieldName: 'requireType',
    editable: true,
    required: true,
  },
  {
    title: '状态',
    dataIndex: 'pass',
  },
  {
    title: '操作',
    dataIndex: 'operation',
    fixed: 'right',
    align: 'center',
    width: 80,
  },
];

export const planColumns: (ColumnTypes[number] &
  EditableColumnType<CoursePlanImportRes>)[] = [
  {
    title: '开课代码',
    dataIndex: 'code',
    editable: true,
    required: false,
  },
  {
    title: '课程编号',
    dataIndex: 'courseCode',
    editable: true,
    required: true,
  },
  {
    title: '课程负责人',
    dataIndex: 'leaderObj',
    fieldName: 'leaderObj',
    fieldType: 'staff',
    editable: true,
    required: true,
    width: 200,
  },
  {
    title: '课程负责人手机号',
    dataIndex: 'phone',
    editable: true,
    required: false,
    width: 200,
  },
  {
    title: '开课周次',
    dataIndex: 'startWeek',
    fieldType: 'select',
    fieldName: 'startWeek',
    editable: true,
    width: 100,
    required: false,
  },
  {
    title: '结课周次',
    dataIndex: 'endWeek',
    fieldType: 'select',
    fieldName: 'endWeek',
    editable: true,
    width: 100,
    required: false,
  },
  {
    title: '考核周次',
    dataIndex: 'examWeek',
    fieldType: 'select',
    fieldName: 'examWeek',
    editable: true,
    width: 100,
    required: false,
  },
  {
    title: '状态',
    dataIndex: 'pass',
  },
  {
    title: '操作',
    dataIndex: 'operation',
    fixed: 'right',
    align: 'center',
    width: 80,
  },
];

export const classColumns: (ColumnTypes[number] &
  EditableColumnType<ClassImportRes>)[] = [
  {
    title: '教学班名称',
    dataIndex: 'name',
    editable: true,
    required: true,
  },
  {
    title: '教学班编号',
    dataIndex: 'code',
    editable: true,
    required: false,
  },
  {
    title: '授课老师姓名',
    dataIndex: 'leaderObj',
    fieldName: 'leaderObj',
    fieldType: 'staff',
    editable: true,
    required: true,
    userSelectProps: {
      multiple: true,
    },
  },
  // {
  //   title: '授课老师手机号',
  //   dataIndex: 'phone',
  //   editable: true,
  //   required: true,
  // },
  {
    title: '状态',
    dataIndex: 'pass',
  },
  {
    title: '操作',
    dataIndex: 'operation',
    fixed: 'right',
    align: 'center',
    width: 80,
  },
];

export const manyClassColumns: (ColumnTypes[number] &
  EditableColumnType<ManyClassStudentImportRes>)[] = [
  {
    title: '教学班名称',
    dataIndex: 'courseClassName',
    editable: true,
    required: true,
  },
  {
    title: '学号',
    dataIndex: 'studentCode',
    editable: true,
    required: false,
  },
  {
    title: '姓名',
    dataIndex: 'studentName',
    // fieldName: 'studentId',
    editable: false,
    required: true,
  },
  {
    title: '状态',
    dataIndex: 'pass',
  },
  {
    title: '操作',
    dataIndex: 'operation',
    fixed: 'right',
    align: 'center',
    width: 80,
  },
];

export const classStuColumns: (ColumnTypes[number] &
  EditableColumnType<ClassStudentImportRes>)[] = [
  {
    title: '学号',
    dataIndex: 'studentCode',
    editable: true,
    required: true,
  },
  {
    title: '状态',
    dataIndex: 'pass',
  },
  {
    title: '操作',
    dataIndex: 'operation',
    fixed: 'right',
    align: 'center',
    width: 80,
  },
];

// 用于批量按行政班创建教学班的列配置
export const adminClassColumns: (ColumnTypes[number] &
  EditableColumnType<ClassImportRes>)[] = [
  {
    title: '教学班编号',
    dataIndex: 'code',
    editable: true,
    required: false,
  },
  {
    title: '教学班名称',
    dataIndex: 'name',
    editable: true,
    required: true,
  },
  {
    title: '行政班名称',
    dataIndex: 'adClassName',
    fieldName: 'adClassId',
    fieldType: 'adminClass',
    editable: true,
    required: true,
    userSelectProps: {
      multiple: true,
    },
  },
  {
    title: '授课老师姓名',
    dataIndex: 'leaderObj',
    fieldName: 'leaderObj',
    fieldType: 'staff',
    editable: true,
    required: true,
    userSelectProps: {
      multiple: true,
    },
  },
  {
    title: '状态',
    dataIndex: 'pass',
  },
  {
    title: '操作',
    dataIndex: 'operation',
    fixed: 'right',
    align: 'center',
    width: 80,
  },
];
