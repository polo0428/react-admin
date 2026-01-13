import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { XmwCet } from '@/models/xmw_cet.model';
import { XmwCetScore } from '@/models/xmw_cet_score.model';

import { CetController } from './cet.controller';
import { CetService } from './cet.service';

@Module({
  imports: [SequelizeModule.forFeature([XmwCet, XmwCetScore])],
  controllers: [CetController],
  providers: [CetService],
  exports: [CetService],
})
export class CetModule {}

