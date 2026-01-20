/**
 * @file 成绩计算相关工具函数
 */

/**
 * 取历史成绩中的最高分（空值/非数字按 0 处理）
 */
export function getMaxScore(scores: Array<number | string | null | undefined>): number {
  return Math.max(
    ...scores.map((s) => {
      const n = Number(s);
      return Number.isFinite(n) ? n : 0;
    }),
    0,
  );
}


