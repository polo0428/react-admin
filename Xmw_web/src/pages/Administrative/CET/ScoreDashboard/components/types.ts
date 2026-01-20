/**
 * @file CET 成绩管理页的类型定义
 * 目前页面使用 mock 数据，后续接接口时建议把接口响应映射到这些类型，保持组件层稳定。
 */

export type ScoreValue = number;

export interface StudentScore {
  /** 学号 */
  id: string;
  /** 姓名 */
  name: string;
  /** 班级 ID */
  classId: string;
  /** CET-4 历次成绩（固定 8 次占位，没成绩用 0） */
  cet4Scores: ScoreValue[];
  /** CET-6 历次成绩（固定 8 次占位，没成绩用 0） */
  cet6Scores: ScoreValue[];
}

export interface ClassScoreGroup {
  /** 班级 ID */
  id: string;
  /** 班级名称 */
  name: string;
  /** 班级学生成绩 */
  students: StudentScore[];
}


