export enum ExamLevel {
  NCRE1 = '计算机一级',
  NCRE2 = '计算机二级',
  NCRE3 = '计算机三级',
  NCRE4 = '计算机四级',
}

export interface ScoreRecord {
  recordId: string; // 数据库主键ID
  id: string; // 学号
  name: string; // 姓名
  department: string; // 学院
  major: string; // 专业
  batchId: string; // 批次ID
  examLevel: ExamLevel; // 报考级别
  examSubject?: string; // 考试科目
  examDate: string; // 考试日期
  ticketNumber: string; // 准考证号
  totalScore: number; // 总分
  theoryScore: number; // 理论/选择题
  practiceScore: number; // 操作/编程题
  passed: boolean; // 是否通过
}

export interface ScoreStatsData {
  total: number;
  passed: number;
  passRate: string;
  avgScore: number;
  maxScore: number;
}
