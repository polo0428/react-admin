/*
 * @Description: RoleManagement Controller
 * @Version: 2.0
 * @Author: 黄鹏
 * @Date: 2022-10-28 17:39:08
 * @LastEditors: 黄鹏
 * @LastEditTime: 2023-09-28 17:01:39
 */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Session,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'; // swagger 接口文档
import { LoggerInterceptor } from '@/interceptor/logger.interceptor';
import { DeleteResponseDto, UpdateResponseDto } from '@/dto/response.dto'; // 响应体 Dto
import type { SessionTypes } from '@/utils/types';

import {
  CreateRoleManagementDto,
  ListRoleManagementDto,
  ResponseRoleManagementDto,
  SaveRoleManagementDto,
  UpdateRoleStatusDto,
} from './dto';
import { RoleManagementService } from './role-management.service'; // RoleManagement Service

/* swagger 文档 */
@ApiTags('系统设置-角色管理')
@UseInterceptors(LoggerInterceptor)
@Controller('system/role-management')
export class RoleManagementController {
  constructor(private readonly roleManagementService: RoleManagementService) {}

  /**
   * @description: 获取角色管理列表
   * @author: 黄鹏
   */
  @Get()
  @ApiOkResponse({ type: ResponseRoleManagementDto })
  @ApiOperation({ summary: '获取角色管理列表' })
  async getRoleList(@Query() roleInfo: ListRoleManagementDto) {
    const response = await this.roleManagementService.getRoleList(roleInfo);
    return response;
  }

  /**
   * @description: 创建角色数据
   * @author: 黄鹏
   */
  @Post()
  @ApiOkResponse({ type: CreateRoleManagementDto })
  @ApiOperation({ summary: '创建角色数据' })
  async createRole(
    @Body() roleInfo: SaveRoleManagementDto,
    @Session() session: SessionTypes,
  ) {
    const response = await this.roleManagementService.createRole(
      roleInfo,
      session,
    );
    return response;
  }

  /**
   * @description: 更新角色数据
   * @author: 黄鹏
   */
  @Put('/:role_id')
  @ApiOkResponse({ type: UpdateResponseDto })
  @ApiOperation({ summary: '更新角色数据' })
  async updateRole(
    @Param('role_id') role_id: string,
    @Body() roleInfo: SaveRoleManagementDto,
  ) {
    const response = await this.roleManagementService.updateRole(
      role_id,
      roleInfo,
    );
    return response;
  }

  /**
   * @description: 删除角色数据
   * @author: 黄鹏
   */
  @Delete('/:role_id')
  @ApiOkResponse({ type: DeleteResponseDto })
  @ApiOperation({ summary: '删除角色数据' })
  async deleteRole(@Param('role_id') role_id: string) {
    const response = await this.roleManagementService.deleteRole(role_id);
    return response;
  }

  /**
   * @description: 更新角色状态
   * @author: 黄鹏
   */
  @Patch('/:role_id')
  @ApiOkResponse({ type: UpdateResponseDto })
  @ApiOperation({ summary: '更新角色状态' })
  async updateRoleStatus(
    @Param('role_id') role_id: string,
    @Body() { status }: UpdateRoleStatusDto,
  ) {
    const response = await this.roleManagementService.updateRoleStatus(
      role_id,
      status,
    );
    return response;
  }
}
