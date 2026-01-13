import { LOGIN_TYPE } from '@/utils/enums';
import type { EnumValues } from '@/utils/types';

/**
 * @description: 登录类型
 * @Author: 黄鹏
 */
export type LoginType = EnumValues<typeof LOGIN_TYPE>;

/**
 * @description: 登录表单参数
 * @author: 黄鹏
 */
export type LoginParams = {
  type: LoginType;
  user_name?: string;
  password?: string;
  phone?: string;
  captcha?: string;
};
