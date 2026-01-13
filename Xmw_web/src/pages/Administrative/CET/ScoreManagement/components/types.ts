export enum ExamLevel {
  CET4 = 'CET-4',
  CET6 = 'CET-6',
}

export interface ScoreRecord {
  recordId: string; // 数据库主键ID
  id: string; // 学号
  name: string; // 姓名
  department: string; // 学院
  major: string; // 专业
  classId: string; // 班级
  batchId: string; // 批次ID
  examLevel: ExamLevel; // 报考级别
  examDate: string; // 考试日期
  campus: string; // 校区
  ticketNumber: string; // 准考证号
  totalScore: number; // 总分
  listeningScore: number; // 听力
  readingScore: number; // 阅读
  writingTranslationScore: number; // 写作与翻译
  passed: boolean; // 是否通过
}

export interface ScoreStatsData {
  total: number;
  passed: number;
  passRate: string;
  avgScore: number;
  maxScore: number;
}
