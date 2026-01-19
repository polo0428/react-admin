/**
 * @see https://umijs.org/zh-CN/plugins/plugin-access
 * */

import type { InitialStateTypes } from '@/utils/types';

export default function access(initialState: InitialStateTypes | undefined) {
  return {
    // 需求变更：系统不需要登录校验；所有按钮/页面权限默认放行
    operationPermission: (_data: string) => true,
    // 判断是否有权限访问菜单
    adminRouteFilter: (route: any) => true,
  };
}
