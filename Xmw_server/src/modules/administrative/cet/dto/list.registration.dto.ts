import { ApiProperty } from '@nestjs/swagger';

export class ListRegistrationDto {
  @ApiProperty({ description: '考次ID', required: false })
  batch_id?: string;

  @ApiProperty({ description: '学生姓名或学号', required: false })
  keyword?: string;

  @ApiProperty({ description: '报考级别', required: false })
  exam_level?: string;

  @ApiProperty({ description: '当前页码', required: false, default: 1 })
  current?: number;

  @ApiProperty({ description: '每页数量', required: false, default: 20 })
  pageSize?: number;
}
