export type ScoreValue = number;

export interface StudentScore {
  /** 学号 */
  id: string;
  /** 姓名 */
  name: string;
  /** 分组 ID（班级/专业/学院） */
  groupId: string;
  /** 历次成绩（按考次时间升序排列；没成绩用 0） */
  scores: ScoreValue[];
}

export interface GroupScore {
  /** 分组 ID */
  id: string;
  /** 分组名称 */
  name: string;
  /** 学年（来自最近一次有成绩的考次） */
  year?: string;
  /** 学期（来自最近一次有成绩的考次） */
  semester?: string;
  /** 分组学生成绩 */
  students: StudentScore[];
}


