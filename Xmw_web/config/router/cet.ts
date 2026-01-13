/*
 * @Description: CET考试管理模块
 * @Version: 2.0
 * @Author: Cyan
 * @Date: 2022-09-08 15:12:38
 * @LastEditors: 黄鹏<baiwumm.com>
 * @LastEditTime: 2024-10-28 16:30:22
 */
export default {
  path: '/cet',
  name: 'cet',
  access: 'adminRouteFilter',
  routes: [
    {
      path: '/cet',
      component: './Administrative/CET',
      exact: true,
    },
    {
      path: '/cet/scores',
      component: './Administrative/CET/ScoreManagement',
      name: 'scores',
      hideInMenu: true,
    },
  ],
};
