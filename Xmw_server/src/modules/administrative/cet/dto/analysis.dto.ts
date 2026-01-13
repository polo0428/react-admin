import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GetAnalysisDto {
  @ApiProperty({ description: '考次ID' })
  @IsString()
  @IsNotEmpty()
  batch_id: string;
}
