/**
 * @file CET 成绩 mock 数据
 * 为了先把页面/交互落地，这里使用随机生成数据；后续接入接口时可直接替换为接口请求。
 */

import type { ClassScoreGroup, StudentScore } from './types';

/**
 * 随机生成某次考试的分数（0 表示缺考/未出分）
 * - 前 2 次大概率无成绩，贴近“新生/刚开始考试”的场景
 */
function generateScores(): number[] {
  return Array(8)
    .fill(0)
    .map((_, i) => {
      if (i < 2) return 0;
      if (Math.random() < 0.3) return 0;
      return Math.floor(Math.random() * (550 - 350) + 350);
    });
}

function generateStudents(count: number, classId: string): StudentScore[] {
  return Array(count)
    .fill(0)
    .map((_, i) => ({
      id: `${20210000 + i}`,
      name: ['张伟', '李强', '王芳', '赵敏', '刘洋', '陈静', '杨康', '周杰'][i % 8] + (i + 1),
      classId,
      cet4Scores: generateScores(),
      cet6Scores: generateScores(),
    }));
}

export const MOCK_CLASSES: ClassScoreGroup[] = [
  { id: 'c1', name: '计算机科学与技术 2101班', students: generateStudents(32, 'c1') },
  { id: 'c2', name: '软件工程 2102班', students: generateStudents(28, 'c2') },
  { id: 'c3', name: '信息安全 2101班', students: generateStudents(30, 'c3') },
  { id: 'c4', name: '网络工程 2103班', students: generateStudents(35, 'c4') },
];


