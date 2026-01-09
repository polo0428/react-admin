import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import { XmwCet } from '@/models/xmw_cet.model';
import { responseMessage } from '@/utils';
import { Response, SessionTypes } from '@/utils/types';

import { SaveCetDto } from './dto/save.cet.dto';

@Injectable()
export class CetService {
  constructor(
    @InjectModel(XmwCet)
    private readonly cetModel: typeof XmwCet,
  ) {}

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
}
