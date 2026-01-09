import { Body, Controller, Post, Session, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Response, SessionTypes } from '@/utils/types';

import { CetService } from './cet.service';
import { SaveCetDto } from './dto/save.cet.dto';

@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth('jwt')
@ApiTags('行政管理-考次管理')
@Controller('administrative/cet')
export class CetController {
  constructor(private readonly cetService: CetService) {}

  @Post('save')
  @ApiOperation({ summary: '保存考次' })
  saveCet(
    @Body() cetInfo: SaveCetDto,
    @Session() session: SessionTypes,
  ): Promise<Response<SaveCetDto>> {
    return this.cetService.saveCet(cetInfo, session);
  }
}
