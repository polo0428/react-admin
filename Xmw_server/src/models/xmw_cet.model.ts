import {
  Column,
  DataType,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

import { CetAttributes } from '@/utils/types/administrative';

@Table({ tableName: 'xmw_cet' })
export class XmwCet
  extends Model<CetAttributes, CetAttributes>
  implements CetAttributes
{
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    allowNull: false,
    defaultValue: DataType.UUIDV4,
    comment: '主键id',
  })
  id: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: false,
    comment: '学年',
  })
  year: string;

  @Column({
    type: DataType.STRING(10),
    allowNull: false,
    comment: '学期',
  })
  semester: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    comment: '考次名称',
  })
  name: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    comment: '考试日期',
  })
  exam_date: Date;

  @Column({
    type: DataType.STRING(20),
    allowNull: false,
    defaultValue: 'planning',
    comment: '状态',
  })
  status: string;

  @Column({
    type: DataType.UUID,
    allowNull: true,
    comment: '创建人',
  })
  founder: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    defaultValue: 0,
    comment: '排序',
  })
  sort: number;

  @Column({
    type: DataType.STRING(200),
    allowNull: true,
    comment: '描述',
  })
  describe: string;
}
