import { ApiProperty } from '@nestjs/swagger';

export class SaveScoreDto {
  @ApiProperty({ description: '主键ID', required: false })
  id?: string;

  @ApiProperty({ description: '学生姓名', required: true })
  name: string;

  @ApiProperty({ description: '学号', required: false })
  student_no?: string;

  @ApiProperty({ description: '证件号码', required: false })
  id_card?: string;

  @ApiProperty({ description: '年级', required: false })
  grade?: string;

  @ApiProperty({ description: '学院' })
  department?: string;

  @ApiProperty({ description: '专业' })
  major?: string;

  @ApiProperty({ description: '班级' })
  class_name?: string;

  @ApiProperty({ description: '教学班', required: false })
  teaching_class?: string;

  @ApiProperty({ description: '学员大队', required: false })
  brigade?: string;

  @ApiProperty({ description: '学员队', required: false })
  squadron?: string;

  @ApiProperty({ description: '学员类型', required: false })
  student_type?: string;

  @ApiProperty({
    description: '培养层次(1大专/2本科/3研究生)',
    required: false,
    enum: [1, 2, 3],
  })
  cultivation_level?: number;

  @ApiProperty({ description: '考次ID', required: true })
  batch_id: string;

  @ApiProperty({
    description: '考试级别',
    required: true,
    enum: ['CET-4', 'CET-6'],
  })
  exam_level: string;

  @ApiProperty({ description: '准考证号', required: false })
  ticket_number?: string;

  @ApiProperty({ description: '听力成绩', required: false })
  listening_score?: number;

  @ApiProperty({ description: '阅读成绩', required: false })
  reading_score?: number;

  @ApiProperty({ description: '写作与翻译成绩', required: false })
  writing_score?: number;

  @ApiProperty({ description: '总分', required: false })
  total_score?: number;

  @ApiProperty({ description: '校区' })
  campus?: string;
}
