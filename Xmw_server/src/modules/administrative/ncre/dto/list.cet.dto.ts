import { ApiProperty } from '@nestjs/swagger';

export class ListCetDto {
  @ApiProperty({
    type: String,
    description: '考次名称',
    required: false,
  })
  name?: string;

  @ApiProperty({
    type: String,
    description: '状态',
    required: false,
  })
  status?: string;

  @ApiProperty({
    type: Number,
    description: '当前页码',
    default: 1,
  })
  current?: number;

  @ApiProperty({
    type: Number,
    description: '每页条数',
    default: 20,
  })
  pageSize?: number;
}

