/*
 * @Description: 应用程序的根模块(Module)
 * @Version: 2.0
 * @Author: 黄鹏
 * @Date: 2022-10-24 13:12:14
 * @LastEditors: 黄鹏<baiwumm.com>
 * @LastEditTime: 2024-11-18 09:54:58
 */
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';

import { CetModule } from '@/modules/administrative/cet/cet.module'; // 智能行政-CET考试
import { CetModule as NcreModule } from '@/modules/administrative/ncre/cet.module'; // 智能行政-计算机等级考试
import { AuthModule } from '@/modules/auth/auth.module'; // 用户鉴权
import { CommonModule } from '@/modules/common/common.module';
import { FilesModule } from '@/modules/files/files.module'; // 文件上传
import { MenuManagementModule } from '@/modules/system/menu-management/menu-management.module'; // 系统设置-菜单管理
import { OperationLogsModule } from '@/modules/system/operation-logs/operation-logs.module'; // 系统设置-操作日志
import { RoleManagementModule } from '@/modules/system/role-management/role-management.module'; // 系统设置-角色管理
import { UserManagementModule } from '@/modules/system/user-management/user-management.module'; // 系统设置-用户管理

import App_globalConfig from './config/configuration'; // 全局配置
import DatabaseConfig from './config/database'; // 数据库配置

@Module({
  imports: [
    // 全局配置 Module
    ConfigModule.forRoot({
      envFilePath: '.development.env', // 设置 .env 文件路径
      isGlobal: true,
      load: [App_globalConfig, DatabaseConfig],
    }),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      // 注入 database 配置
      useFactory: async (configService: ConfigService) => {
        return configService.get('database');
      },
      inject: [ConfigService],
    }),
    MenuManagementModule,
    RoleManagementModule,
    UserManagementModule,
    OperationLogsModule,
    FilesModule,
    AuthModule,
    CommonModule,
    CetModule,
    NcreModule,
  ],
})
export class AppModule {}
