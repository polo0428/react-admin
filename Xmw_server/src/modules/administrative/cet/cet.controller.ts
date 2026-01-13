import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Session,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { XmwCet } from '@/models/xmw_cet.model';
import { XmwCetScore } from '@/models/xmw_cet_score.model';
import { PageResponse, Response, SessionTypes } from '@/utils/types';

import { CetService } from './cet.service';
import { ListCetDto, ListScoreDto, SaveCetDto, SaveScoreDto } from './dto';

@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth('jwt')
@ApiTags('行政管理-考次管理')
@Controller('administrative/cet')
export class CetController {
  constructor(private readonly cetService: CetService) {}

  @Get()
  @ApiOperation({ summary: '获取考次列表' })
  getCetList(
    @Query() cetInfo: ListCetDto,
  ): Promise<Response<PageResponse<XmwCet>>> {
    return this.cetService.getCetList(cetInfo);
  }

  @Post('save')
  @ApiOperation({ summary: '保存考次' })
  saveCet(
    @Body() cetInfo: SaveCetDto,
    @Session() session: SessionTypes,
  ): Promise<Response<SaveCetDto>> {
    return this.cetService.saveCet(cetInfo, session);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除考次' })
  deleteCet(@Param('id') id: string): Promise<Response<number>> {
    return this.cetService.deleteCet(id);
  }

  @Get('score')
  @ApiOperation({ summary: '获取成绩列表' })
  getScoreList(
    @Query() scoreInfo: ListScoreDto,
  ): Promise<Response<PageResponse<XmwCetScore>>> {
    return this.cetService.getScoreList(scoreInfo);
  }

  @Post('score/save')
  @ApiOperation({ summary: '保存成绩' })
  saveScore(@Body() scoreInfo: SaveScoreDto): Promise<Response<XmwCetScore>> {
    return this.cetService.saveScore(scoreInfo);
  }
}

