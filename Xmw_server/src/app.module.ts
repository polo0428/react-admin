import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';

import { CetModule } from '@/modules/administrative/cet/cet.module'; // 智能行政-CET考试
import { CetModule as NcreModule } from '@/modules/administrative/ncre/cet.module'; // 智能行政-计算机等级考试
import { CommonModule } from '@/modules/common/common.module';
import { FilesModule } from '@/modules/files/files.module'; // 文件上传

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
    FilesModule,
    CommonModule,
    CetModule,
    NcreModule,
  ],
})
export class AppModule {}
