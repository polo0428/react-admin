import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import type { WhereOptions } from 'sequelize/types';

import { XmwCet } from '@/models/xmw_cet.model';
import { responseMessage } from '@/utils';
import { PageResponse, Response, SessionTypes } from '@/utils/types';

import { ListCetDto, SaveCetDto } from './dto';

@Injectable()
export class CetService {
  constructor(
    @InjectModel(XmwCet)
    private readonly cetModel: typeof XmwCet,
  ) {}

  /**
   * @description: 获取考次列表
   * @author: 白雾茫茫丶
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
   * @author: 白雾茫茫丶
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
   * @author: 白雾茫茫丶
   */
  async deleteCet(id: string): Promise<Response<number>> {
    const result = await this.cetModel.destroy({ where: { id } });
    return responseMessage(result);
  }
}

