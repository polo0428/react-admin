import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { XmwCet } from '@/models/xmw_cet.model';
import { XmwCetRegistration } from '@/models/xmw_cet_registration.model';
import { XmwCetScore } from '@/models/xmw_cet_score.model';
import { PageResponse, Response } from '@/utils/types';

import { CetService } from './cet.service';
import {
  GetAnalysisDto,
  ListCetDto,
  ListRegistrationDto,
  ListScoreDto,
  SaveCetDto,
  SaveRegistrationDto,
  SaveScoreDto,
  ScoreAnalysisDto,
} from './dto';

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
  saveCet(@Body() cetInfo: SaveCetDto): Promise<Response<SaveCetDto>> {
    return this.cetService.saveCet(cetInfo);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除考次' })
  deleteCet(@Param('id') id: string): Promise<Response<number>> {
    return this.cetService.deleteCet(id);
  }

  @Delete('score/:id')
  @ApiOperation({ summary: '删除成绩' })
  deleteScore(@Param('id') id: string): Promise<Response<number>> {
    return this.cetService.deleteScore(id);
  }

  @Get('score')
  @ApiOperation({ summary: '获取成绩列表' })
  getScoreList(
    @Query() scoreInfo: ListScoreDto,
  ): Promise<Response<PageResponse<XmwCetScore>>> {
    return this.cetService.getScoreList(scoreInfo);
  }

  @Get('registration')
  @ApiOperation({ summary: '获取报名列表' })
  getRegistrationList(
    @Query() regInfo: ListRegistrationDto,
  ): Promise<Response<PageResponse<XmwCetRegistration>>> {
    return this.cetService.getRegistrationList(regInfo);
  }

  @Post('registration/save')
  @ApiOperation({ summary: '保存报名信息' })
  saveRegistration(
    @Body() regInfo: SaveRegistrationDto,
  ): Promise<Response<XmwCetRegistration>> {
    return this.cetService.saveRegistration(regInfo);
  }

  @Delete('registration/:id')
  @ApiOperation({ summary: '删除报名' })
  deleteRegistration(@Param('id') id: string): Promise<Response<number>> {
    return this.cetService.deleteRegistration(id);
  }

  @Post('score/save')
  @ApiOperation({ summary: '保存成绩' })
  saveScore(@Body() scoreInfo: SaveScoreDto): Promise<Response<XmwCetScore>> {
    return this.cetService.saveScore(scoreInfo);
  }

  @Get('score/analysis')
  @ApiOperation({ summary: '获取成绩分析' })
  getScoreAnalysis(
    @Query() analysisInfo: ScoreAnalysisDto,
  ): Promise<Response<any>> {
    return this.cetService.getScoreAnalysis(analysisInfo);
  }

  @Get('analysis/dashboard')
  @ApiOperation({ summary: '获取仪表盘分析数据' })
  getAnalysisDashboard(
    @Query() analysisInfo: GetAnalysisDto,
  ): Promise<Response<any>> {
    return this.cetService.getAnalysisDashboard(analysisInfo);
  }

  @Post('import-registration')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: '导入报名数据' })
  async importRegistration(
    @UploadedFile() file: Express.Multer.File,
    @Body('batch_id') batch_id: string,
  ): Promise<Response<any>> {
    return this.cetService.importRegistration(file, batch_id);
  }

  @Post('import-score')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: '导入成绩数据' })
  async importScore(
    @UploadedFile() file: Express.Multer.File,
    @Body('batch_id') batch_id: string,
  ): Promise<Response<any>> {
    return this.cetService.importScore(file, batch_id);
  }
}
