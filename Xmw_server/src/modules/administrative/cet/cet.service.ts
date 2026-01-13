import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import type { WhereOptions } from 'sequelize/types';
import { Sequelize } from 'sequelize-typescript';

import { XmwCet } from '@/models/xmw_cet.model';
import { XmwCetScore } from '@/models/xmw_cet_score.model';
import { responseMessage } from '@/utils';
import { PageResponse, Response, SessionTypes } from '@/utils/types';

import {
  GetAnalysisDto,
  ListCetDto,
  ListScoreDto,
  SaveCetDto,
  SaveScoreDto,
  ScoreAnalysisDto,
} from './dto';

@Injectable()
export class CetService {
  constructor(
    @InjectModel(XmwCet)
    private readonly cetModel: typeof XmwCet,
    @InjectModel(XmwCetScore)
    private readonly scoreModel: typeof XmwCetScore,
    private readonly sequelize: Sequelize,
  ) {}

  /**
   * @description: 获取考次列表
   * @author: 黄鹏
   */
  async getCetList(
    cetInfo: ListCetDto,
  ): Promise<Response<PageResponse<XmwCet>>> {
    const { name, status, pageSize = 20, current = 1 } = cetInfo;
    const where: WhereOptions = {};
    if (name) where.name = { [Op.substring]: name };
    if (status) where.status = { [Op.eq]: status };

    const total = await this.cetModel.count({ where });
    const result = await this.cetModel.findAll({
      offset: (Number(current) - 1) * pageSize,
      limit: Number(pageSize),
      where,
      order: [
        ['exam_date', 'DESC'], // 按考试日期倒序
        ['created_time', 'DESC'],
      ],
      raw: true,
    });
    return responseMessage({ list: result, total });
  }

  /**
   * @description: 保存考次
   * @author: 黄鹏
   */
  async saveCet(
    { id, ...cetInfo }: SaveCetDto,
    session: SessionTypes,
  ): Promise<Response<SaveCetDto>> {
    const founder = session?.currentUserInfo?.user_id;
    let result;
    if (id) {
      result = await this.cetModel.update(cetInfo, { where: { id } });
    } else {
      result = await this.cetModel.create({ ...cetInfo, founder });
    }
    return responseMessage(result);
  }

  /**
   * @description: 删除考次
   * @author: 黄鹏
   */
  async deleteCet(id: string): Promise<Response<number>> {
    const result = await this.cetModel.destroy({ where: { id } });
    return responseMessage(result);
  }

  /**
   * @description: 删除成绩
   * @author: 黄鹏
   */
  async deleteScore(id: string): Promise<Response<number>> {
    const result = await this.scoreModel.destroy({ where: { id } });
    return responseMessage(result);
  }

  /**
   * @description: 获取成绩列表
   * @author: 黄鹏
   */
  async getScoreList(
    scoreInfo: ListScoreDto,
  ): Promise<Response<PageResponse<XmwCetScore>>> {
    const {
      batch_id,
      keyword,
      exam_level,
      pageSize = 20,
      current = 1,
    } = scoreInfo;
    const where: any = {};
    const andWhere: WhereOptions[] = [];

    if (batch_id) where.batch_id = { [Op.eq]: batch_id };
    if (exam_level) where.exam_level = { [Op.eq]: exam_level };

    if (keyword) {
      andWhere.push({
        [Op.or]: [
          { name: { [Op.substring]: keyword } },
          { student_no: { [Op.substring]: keyword } },
        ],
      });
    }

    if (andWhere.length > 0) {
      where[Op.and] = andWhere;
    }

    const total = await this.scoreModel.count({ where });
    const result = await this.scoreModel.findAll({
      offset: (Number(current) - 1) * pageSize,
      limit: Number(pageSize),
      where,
      order: [['created_time', 'DESC']],
      raw: true,
    });
    return responseMessage({ list: result, total });
  }

  /**
   * @description: 保存成绩
   * @author: 黄鹏
   */
  async saveScore(scoreInfo: SaveScoreDto): Promise<Response<XmwCetScore>> {
    const { id, listening_score, reading_score, writing_score, ...rest } =
      scoreInfo;
    const total_score = listening_score + reading_score + writing_score;
    const is_passed = total_score >= 425;
    const data = {
      ...rest,
      listening_score,
      reading_score,
      writing_score,
      total_score,
      is_passed,
    };

    let result;
    if (id) {
      result = await this.scoreModel.update(data, { where: { id } });
    } else {
      result = await this.scoreModel.create(data);
    }
    return responseMessage(result);
  }

  /**
   * @description: 获取成绩分析数据
   * @author: 黄鹏
   */
  async getScoreAnalysis(
    analysisInfo: ScoreAnalysisDto,
  ): Promise<Response<any>> {
    const { batch_id } = analysisInfo;
    const where: WhereOptions = { batch_id };

    const total = await this.scoreModel.count({ where });
    if (total === 0) {
      return responseMessage({
        total: 0,
        passed: 0,
        passRate: '0.0',
        avgScore: 0,
        maxScore: 0,
      });
    }

    const passed = await this.scoreModel.count({
      where: { ...where, is_passed: true },
    });

    // 计算平均分和最高分
    const scores = await this.scoreModel.findAll({
      attributes: ['total_score'],
      where,
      raw: true,
    });

    const totalScoreSum = scores.reduce((sum, s) => sum + s.total_score, 0);
    const avgScore = Math.round(totalScoreSum / total);
    const maxScore = Math.max(...scores.map((s) => s.total_score));
    const passRate = ((passed / total) * 100).toFixed(1);

    return responseMessage({
      total,
      passed,
      passRate,
      avgScore,
      maxScore,
    });
  }

  /**
   * @description: 获取仪表盘分析数据
   * @author: 黄鹏
   */
  async getAnalysisDashboard(
    analysisInfo: GetAnalysisDto,
  ): Promise<Response<any>> {
    const { batch_id } = analysisInfo;

    // 1. 获取当前考次信息
    const currentBatch = await this.cetModel.findByPk(batch_id);
    if (!currentBatch) {
      return responseMessage(null, '考次不存在', -1);
    }

    // 2. 获取上一次考次信息 (按时间倒序的前一个)
    const previousBatch = await this.cetModel.findOne({
      where: {
        exam_date: { [Op.lt]: currentBatch.exam_date },
      },
      order: [['exam_date', 'DESC']],
    });

    // 3. 获取当前考次所有成绩
    const currentScores = await this.scoreModel.findAll({
      where: { batch_id },
      raw: true,
    });

    // 4. 获取上一次考次所有成绩
    let previousScores: XmwCetScore[] = [];
    if (previousBatch) {
      previousScores = await this.scoreModel.findAll({
        where: { batch_id: previousBatch.id },
        raw: true,
      });
    }

    // --- 计算统计卡片数据 ---
    const totalCandidates = currentScores.length;
    const prevTotalCandidates = previousScores.length;

    // 计算同比增幅
    let totalCandidatesDiff = '-';
    if (prevTotalCandidates > 0) {
      const diff =
        ((totalCandidates - prevTotalCandidates) / prevTotalCandidates) * 100;
      totalCandidatesDiff = (diff > 0 ? '+' : '') + diff.toFixed(1) + '%';
    }
    const totalCandidatesYoY = totalCandidatesDiff;

    // 辅助函数：计算通过率
    const calcPassRate = (scores: XmwCetScore[]) => {
      if (scores.length === 0) return 0;
      const passed = scores.filter((s) => s.total_score >= 425).length;
      return (passed / scores.length) * 100;
    };

    // 筛选 CET4/CET6
    const isCet4 = (s: XmwCetScore) =>
      s.exam_level === 'CET4' || s.exam_level === 'CET-4';
    const isCet6 = (s: XmwCetScore) =>
      s.exam_level === 'CET6' || s.exam_level === 'CET-6';

    const cet4Scores = currentScores.filter(isCet4);
    const cet6Scores = currentScores.filter(isCet6);
    const prevCet4Scores = previousScores.filter(isCet4);
    const prevCet6Scores = previousScores.filter(isCet6);

    const cet4PassRateVal = calcPassRate(cet4Scores);
    const cet6PassRateVal = calcPassRate(cet6Scores);
    const prevCet4PassRateVal = calcPassRate(prevCet4Scores);
    const prevCet6PassRateVal = calcPassRate(prevCet6Scores);

    const cet4Diff = cet4PassRateVal - prevCet4PassRateVal;
    const cet6Diff = cet6PassRateVal - prevCet6PassRateVal;

    const cet4PassRateYoY =
      (cet4Diff >= 0 ? '+' : '') + cet4Diff.toFixed(1) + '%';
    const cet6PassRateYoY =
      (cet6Diff >= 0 ? '+' : '') + cet6Diff.toFixed(1) + '%';

    const avgScore =
      totalCandidates > 0
        ? Math.round(
            currentScores.reduce((a, b) => a + b.total_score, 0) /
              totalCandidates,
          )
        : 0;
    const maxScore =
      totalCandidates > 0
        ? Math.max(...currentScores.map((s) => s.total_score))
        : 0;

    // --- 趋势图 (Trend Chart) - 最近6次 ---
    const lastBatches = await this.cetModel.findAll({
      where: {
        exam_date: { [Op.lte]: currentBatch.exam_date },
      },
      order: [['exam_date', 'DESC']],
      limit: 6,
      raw: true,
    });

    const batchIds = lastBatches.map((b) => b.id);
    const allTrendScores = await this.scoreModel.findAll({
      where: { batch_id: { [Op.in]: batchIds } },
      attributes: ['batch_id', 'exam_level', 'total_score', 'is_passed'],
      raw: true,
    });

    const trendData = lastBatches.reverse().map((batch) => {
      const bScores = allTrendScores.filter((s) => s.batch_id === batch.id);
      const bCet4 = bScores.filter(
        (s) => s.exam_level === 'CET4' || s.exam_level === 'CET-4',
      );
      const bCet6 = bScores.filter(
        (s) => s.exam_level === 'CET6' || s.exam_level === 'CET-6',
      );
      return {
        batchName: batch.name,
        cet4PassRate: parseFloat(calcPassRate(bCet4).toFixed(1)),
        cet6PassRate: parseFloat(calcPassRate(bCet6).toFixed(1)),
      };
    });

    // --- 雷达图 (Radar Chart) ---
    const calcAvg = (scores: XmwCetScore[], field: keyof XmwCetScore) => {
      if (scores.length === 0) return 0;
      const sum = scores.reduce((acc, s) => acc + (Number(s[field]) || 0), 0);
      return Math.round(sum / scores.length);
    };

    const curListening = calcAvg(currentScores, 'listening_score');
    const curReading = calcAvg(currentScores, 'reading_score');
    const curWriting = calcAvg(currentScores, 'writing_score');

    const prevListening = calcAvg(previousScores, 'listening_score');
    const prevReading = calcAvg(previousScores, 'reading_score');
    const prevWriting = calcAvg(previousScores, 'writing_score');

    const radarData = [
      { subject: '听力', A: curListening, B: prevListening },
      { subject: '阅读', A: curReading, B: prevReading },
      { subject: '写作/翻译', A: curWriting, B: prevWriting },
    ];

    // --- 分布图 (Distribution Chart) - 分别统计 CET4 和 CET6 ---
    const getDistData = (scores: XmwCetScore[]) => [
      {
        range: '<425',
        count: scores.filter((s) => s.total_score < 425).length,
      },
      {
        range: '425-500',
        count: scores.filter((s) => s.total_score >= 425 && s.total_score < 500)
          .length,
      },
      {
        range: '500-600',
        count: scores.filter(
          (s) => s.total_score >= 500 && s.total_score <= 600,
        ).length,
      },
      {
        range: '>600',
        count: scores.filter((s) => s.total_score > 600).length,
      },
    ];

    const distData = getDistData(cet4Scores);
    const cet6DistData = getDistData(cet6Scores);

    return responseMessage({
      totalCandidates,
      totalCandidatesYoY,
      cet4PassRate: cet4PassRateVal.toFixed(1) + '%',
      cet4PassRateYoY,
      cet6PassRate: cet6PassRateVal.toFixed(1) + '%',
      cet6PassRateYoY,
      avgScore,
      maxScore,
      trendData,
      radarData,
      distributionData: distData,
      cet6DistributionData: cet6DistData,
    });
  }
}
