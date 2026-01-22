/*
 * @Description: 计算机等级考试管理模块
 * @Version: 2.0
 * @Author: Cyan
 * @Date: 2022-09-08 15:12:38
 * @LastEditors: 黄鹏<baiwumm.com>
 * @LastEditTime: 2024-10-28 16:30:22
 */
export default {
  path: '/ncre',
  name: 'ncre',
  access: 'adminRouteFilter',
  routes: [
    {
      path: '/ncre',
      redirect: '/ncre/list',
      exact: true,
    },
    {
      path: '/ncre/list',
      component: './Administrative/NCRE',
      name: 'examList',
    },
    /**
     * NCRE 成绩综合看板（班级/专业/学院维度聚合）
     * 独立页面，不依赖具体“考次”选择
     */
    {
      path: '/ncre/score-dashboard',
      component: './Administrative/NCRE/ScoreDashboard',
      name: 'scoreDashboard',
      icon: 'barChart',
    },
    {
      path: '/ncre/scores',
      component: './Administrative/NCRE/ScoreManagement',
      name: 'scores',
      hideInMenu: true,
    },
    {
      path: '/ncre/registrations',
      component: './Administrative/NCRE/RegistrationManagement',
      name: 'registrations',
      hideInMenu: true,
    },
    {
      path: '/ncre/analysis',
      component: './Administrative/NCRE/Analysis',
      name: 'analysis',
      hideInMenu: true,
    },
    {
      path: '/ncre/import-reg',
      component: './Administrative/NCRE/ImportRegistration',
      name: 'import-reg',
      hideInMenu: true,
    },
    {
      path: '/ncre/import-score',
      component: './Administrative/NCRE/ImportScore',
      name: 'import-score',
      hideInMenu: true,
    },
  ],
};
