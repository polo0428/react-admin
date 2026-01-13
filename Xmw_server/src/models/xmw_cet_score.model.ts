import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

import { XmwCet } from './xmw_cet.model';

@Table({ tableName: 'xmw_cet_score' })
export class XmwCetScore extends Model<XmwCetScore> {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    comment: '主键ID',
  })
  id: string;

  @Column({ comment: '学生姓名', allowNull: false })
  name: string;

  @Column({ comment: '学号', allowNull: false })
  student_no: string;

  @Column({ comment: '学院' })
  department: string;

  @Column({ comment: '专业' })
  major: string;

  @Column({ comment: '班级' })
  class_name: string;

  @ForeignKey(() => XmwCet)
  @Column({ type: DataType.UUID, comment: '考次ID', allowNull: false })
  batch_id: string;

  @BelongsTo(() => XmwCet)
  batch: XmwCet;

  @Column({ comment: '考试级别', allowNull: false })
  exam_level: string;

  @Column({ comment: '准考证号', allowNull: false })
  ticket_number: string;

  @Column({ type: DataType.FLOAT, comment: '听力成绩', defaultValue: 0 })
  listening_score: number;

  @Column({ type: DataType.FLOAT, comment: '阅读成绩', defaultValue: 0 })
  reading_score: number;

  @Column({ type: DataType.FLOAT, comment: '写作与翻译成绩', defaultValue: 0 })
  writing_score: number;

  @Column({ type: DataType.FLOAT, comment: '总分', defaultValue: 0 })
  total_score: number;

  @Column({ type: DataType.BOOLEAN, comment: '是否通过' })
  is_passed: boolean;

  @Column({ comment: '校区', defaultValue: '本部' })
  campus: string;
}

