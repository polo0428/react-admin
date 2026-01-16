import { ApiProperty } from '@nestjs/swagger';

export class SaveScoreDto {
  @ApiProperty({ description: '主键ID', required: false })
  id?: string;

  @ApiProperty({ description: '学生姓名', required: true })
  name: string;

  @ApiProperty({ description: '学号', required: true })
  student_no: string;

  @ApiProperty({ description: '学院' })
  department?: string;

  @ApiProperty({ description: '专业' })
  major?: string;

  @ApiProperty({ description: '班级' })
  class_name?: string;

  @ApiProperty({ description: '考次ID', required: true })
  batch_id: string;

  @ApiProperty({
    description: '考试级别',
    required: true,
    // 兼容 “级别|科目” 的存储方式
    enum: ['计算机一级', '计算机二级', '计算机三级', '计算机四级'],
  })
  exam_level: string;

  @ApiProperty({ description: '准考证号', required: true })
  ticket_number: string;

  @ApiProperty({ description: '理论/选择题（复用 listening_score 字段）', required: true })
  listening_score: number;

  @ApiProperty({ description: '操作/编程题（复用 reading_score 字段）', required: true })
  reading_score: number;

  @ApiProperty({ description: '兼容字段（当前固定为 0）', required: true })
  writing_score: number;

  @ApiProperty({ description: '校区' })
  campus?: string;
}
