import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class SaveRegistrationDto {
  @ApiProperty({ description: '主键ID', required: false })
  id?: string;

  @ApiProperty({ description: '考次ID', required: true })
  @IsNotEmpty({ message: '考次ID不能为空' })
  batch_id: string;

  @ApiProperty({ description: '姓名', required: true })
  @IsNotEmpty({ message: '姓名不能为空' })
  name: string;

  @ApiProperty({ description: '证件号码', required: false })
  @IsOptional()
  id_card?: string;

  @ApiProperty({ description: '学号', required: false })
  @IsOptional()
  student_no?: string;

  @ApiProperty({ description: '年级', required: false })
  grade?: string;

  @ApiProperty({ description: '教学班', required: false })
  teaching_class?: string;

  @ApiProperty({ description: '学员大队', required: false })
  brigade?: string;

  @ApiProperty({ description: '学员队', required: false })
  squadron?: string;

  @ApiProperty({ description: '学员类型', required: false })
  student_type?: string;

  @ApiProperty({ description: '学院', required: false })
  department?: string;

  @ApiProperty({ description: '专业', required: false })
  major?: string;

  @ApiProperty({ description: '班级', required: false })
  class_name?: string;

  @ApiProperty({ description: '报考级别', required: false })
  exam_level?: string;

  @ApiProperty({ description: '准考证号', required: false })
  ticket_number?: string;

  @ApiProperty({ description: '校区', required: false })
  campus?: string;
}

