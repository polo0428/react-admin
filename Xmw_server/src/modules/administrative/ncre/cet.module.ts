import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { XmwNcre } from '@/models/xmw_ncre.model';
import { XmwNcreRegistration } from '@/models/xmw_ncre_registration.model';
import { XmwNcreScore } from '@/models/xmw_ncre_score.model';

import { CetController } from './cet.controller';
import { CetService } from './cet.service';

@Module({
  imports: [
    SequelizeModule.forFeature([XmwNcre, XmwNcreScore, XmwNcreRegistration]),
  ],
  controllers: [CetController],
  providers: [CetService],
  exports: [CetService],
})
export class CetModule {}
