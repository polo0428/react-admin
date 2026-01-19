/*
 * @Description: OperationLogs Controller
 * @Version: 2.0
 * @Author: 黄鹏
 * @Date: 2022-12-12 10:10:55
 * @LastEditors: 黄鹏<baiwumm.com>
 * @LastEditTime: 2024-10-25 15:32:48
 */
import {
  Body,
  Controller,
  Delete,
  Get,
  Query,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger'; // swagger 接口文档

import { DeleteResponseDto } from '@/dto/response.dto'; // 响应体 Dto

import {
  DelLogsDto,
  ListOperationLogsDto,
  ResponseOperationLogsDto,
} from './dto';
import { OperationLogsService } from './operation-logs.service'; // OperationLogs Service

@Controller('system/operation-log')
export class OperationLogsController {
  constructor(private readonly operationLogsService: OperationLogsService) {}
  /**
   * @description: 获取操作日志列表
   * @author: 黄鹏
   */
  @Get()
  @ApiOkResponse({ type: ResponseOperationLogsDto })
  @ApiOperation({ summary: '获取操作日志列表' })
  async getLogsList(@Query() logsInfo: ListOperationLogsDto) {
    const response = await this.operationLogsService.getLogsList(logsInfo);
    return response;
  }

  /**
   * @description: 删除操作日志
   * @author: 黄鹏
   */
  @Delete()
  @ApiOkResponse({ type: DeleteResponseDto })
  @ApiOperation({ summary: '删除操作日志' })
  async deleteLogs(@Body() body: DelLogsDto) {
    const response = await this.operationLogsService.deleteLogs(body.ids);
    return response;
  }
}
