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
}
