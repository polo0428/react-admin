/*
 * @Description: 全局常量数据（当前项目仅保留 CET/NCRE 菜单所需常量）
 */
import { ROUTES } from '@/utils/enums';
import type { UmiIcon } from '@/utils/types';

/**
 * @description: 路由菜单对应的 remixicon
 * @author: 黄鹏
 */
export const MenuRemixIconMap: Record<string, UmiIcon> = {
  [ROUTES.CET]: 'ri:file-list-3-line',
  // 如果你也想在菜单中显示 NCRE，这里补一项
  [ROUTES.NCRE]: 'ri:file-list-3-line',
};
