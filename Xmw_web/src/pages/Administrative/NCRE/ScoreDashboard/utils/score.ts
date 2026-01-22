export const getMaxScore = (scores: number[] | undefined) => {
  if (!Array.isArray(scores) || scores.length === 0) return 0;
  return scores.reduce((max, s) => Math.max(max, Number(s) || 0), 0);
};


