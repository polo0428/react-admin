/*
 * @Description: Administrative Attributes
 * @Version: 2.0
 * @Author: 黄鹏
 * @Date: 2022-10-27 10:12:33
 * @LastEditors: 黄鹏
 * @LastEditTime: 2023-10-09 10:27:57
 */
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
