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

@Table({ tableName: 'xmw_cet_registration' })
export class XmwCetRegistration extends Model<XmwCetRegistration> {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    comment: '主键ID',
  })
  id: string;

  @Column({ comment: '学生姓名', allowNull: false })
  name: string;

  // 兼容旧模板：学号（新模板可能不再提供，故改为可空）
  @Column({ comment: '学号', allowNull: true })
  student_no: string;

  @Column({ comment: '证件号码' })
  id_card: string;

  @Column({ comment: '年级' })
  grade: string;

  @Column({ comment: '学院' })
  department: string;

  @Column({ comment: '专业' })
  major: string;

  @Column({ comment: '班级' })
  class_name: string;

  @Column({ comment: '教学班' })
  teaching_class: string;

  @Column({ comment: '学员大队' })
  brigade: string;

  @Column({ comment: '学员队' })
  squadron: string;

  @Column({ comment: '学员类型' })
  student_type: string;

  @ForeignKey(() => XmwCet)
  @Column({ type: DataType.UUID, comment: '考次ID', allowNull: false })
  batch_id: string;

  @BelongsTo(() => XmwCet)
  batch: XmwCet;

  @Column({ comment: '报考级别' })
  exam_level: string;

  @Column({ comment: '准考证号' })
  ticket_number: string;

  @Column({ comment: '校区', defaultValue: '本部' })
  campus: string;
}
