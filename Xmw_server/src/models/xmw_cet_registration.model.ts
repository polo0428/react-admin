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

  @Column({ comment: '报考级别' })
  exam_level: string;

  @Column({ comment: '准考证号' })
  ticket_number: string;

  @Column({ comment: '校区', defaultValue: '本部' })
  campus: string;
}


