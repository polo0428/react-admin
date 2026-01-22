import type {
  CommonTypes,
  Times,
} from '@/utils/types';

/**
 * @description: xmw_cet Attributes
 * @author: 黄鹏
 */
export type CetAttributes = {
  id: string; // id 主键
  year: string; // 学年
  semester: string; // 学期
  name: string; // 考次名称
  exam_date: Date; // 考试日期
  status: string; // 状态
} & Times &
  Pick<CommonTypes, 'founder' | 'sort' | 'describe'>;

/**
 * @description: xmw_ncre Attributes
 * @author: 黄鹏
 * @note 字段结构目前与 CET 保持一致，仅用于区分不同业务表
 */
export type NcreAttributes = CetAttributes;
