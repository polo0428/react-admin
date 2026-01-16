import { ApiProperty } from '@nestjs/swagger';

export class SaveCetDto {
  @ApiProperty({
    type: String,
    description: '主键id',
    required: false,
  })
  id?: string;

  @ApiProperty({
    type: String,
    description: '学年',
    required: true,
  })
  year: string;

  @ApiProperty({
    type: String,
    description: '学期',
    required: true,
  })
  semester: string;

  @ApiProperty({
    type: String,
    description: '考次名称',
    required: true,
  })
  name: string;

  @ApiProperty({
    type: String,
    description: '考试日期',
    required: true,
  })
  exam_date: Date;

  @ApiProperty({
    type: String,
    description: '状态',
    required: true,
    default: 'planning',
  })
  status: string;

  @ApiProperty({
    type: String,
    description: '描述',
    required: false,
  })
  describe?: string;
}

