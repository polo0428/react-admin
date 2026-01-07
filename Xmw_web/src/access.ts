/**
 * @see https://umijs.org/zh-CN/plugins/plugin-access
 * */

import { forEach } from 'lodash-es'

import type { InitialStateTypes } from '@/utils/types'

export default function access(initialState: InitialStateTypes | undefined) {
  // 获取按钮权限集合
  const { Permissions } = initialState ?? {};
  
  return {
    // 判断是否有操作权限
    operationPermission: (data: string) => Permissions ? Permissions.includes(data) : false,
    // 判断是否有权限访问菜单
    adminRouteFilter: (route: any) => true,
  };
}
