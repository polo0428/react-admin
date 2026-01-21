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
      redirect: '/cet/list',
      exact: true,
    },
    {
      path: '/cet/list',
      component: './Administrative/CET',
      name: 'examList',
    },
    /**
     * CET 成绩管理（班级维度统计 + 学生历史成绩明细）
     * 注意：这是一个独立页面，不依赖具体“考次”选择（先用 mock 数据，后续再接后端接口）
     */
    {
      path: '/cet/score-dashboard',
      component: './Administrative/CET/ScoreDashboard',
      name: 'scoreDashboard',
      icon: 'barChart',
    },
    {
      path: '/cet/scores',
      component: './Administrative/CET/ScoreManagement',
      name: 'scores',
      hideInMenu: true,
    },
    {
      path: '/cet/registrations',
      component: './Administrative/CET/RegistrationManagement',
      name: 'registrations',
      hideInMenu: true,
    },
    {
      path: '/cet/analysis',
      component: './Administrative/CET/Analysis',
      name: 'analysis',
      hideInMenu: true,
    },
    {
      path: '/cet/import-reg',
      component: './Administrative/CET/ImportRegistration',
      name: 'import-reg',
      hideInMenu: true,
    },
    {
      path: '/cet/import-score',
      component: './Administrative/CET/ImportScore',
      name: 'import-score',
      hideInMenu: true,
    },
  ],
};
