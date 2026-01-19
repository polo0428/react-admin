/*
 * @Description: 入口文件-全局 layout 配置
 * @Version: 2.0
 * @Author: 黄鹏
 * @Date: 2022-09-19 20:39:53
 * @LastEditors: 黄鹏<baiwumm.com>
 * @LastEditTime: 2024-10-21 17:45:47
 */
import { ProConfigProvider, Settings as LayoutSettings } from '@ant-design/pro-components';
import { Icon, InitDataType, Link, RunTimeLayoutConfig, useIntl } from '@umijs/max';
import { Space, Typography } from 'antd';
import { toString } from 'lodash-es';

import { formatPerfix, getLocalStorageItem } from '@/utils';
import { MenuRemixIconMap } from '@/utils/const';
import { LOCAL_STORAGE, ROUTES } from '@/utils/enums';
import type { InitialStateTypes } from '@/utils/types';

const { Paragraph } = Typography;

export const BasiLayout: RunTimeLayoutConfig = ({
  initialState,
  setInitialState,
}: InitDataType) => {
  const { formatMessage } = useIntl();
  /* 获取 LAYOUT 的值 */
  const LAYOUT = getLocalStorageItem<LayoutSettings>(LOCAL_STORAGE.LAYOUT);

  // 渲染菜单图标
  const renderMenuicon = (icon: any) => (
    <Icon icon={toString(icon)} style={{ fontSize: 16, display: 'flex' }} />
  );
  return {
    // 需求变更：系统不需要登录页/登录态；同时隐藏顶部 Header
    headerRender: false,
    /* 水印 */
    waterMarkProps: {
      content: initialState?.CurrentUser?.cn_name,
    },
    /* 页面切换时触发 */
    onPageChange: () => {
      // 需求变更：系统不需要登录校验；不做路由级登录拦截
    },
    // menu: {
    //   request: async () => initialState?.RouteMenu,
    // },
    /* 自定义面包屑 */
    breadcrumbProps: {
      itemRender: (route) => {
        return (
          <Space align="center">
            <Icon
              icon={MenuRemixIconMap[route.linkPath as ROUTES] as any}
              style={{ display: 'flex' }}
            />
            <span>{route.breadcrumbName}</span>
          </Space>
        );
      },
    },
    /* 自定义菜单项的 render 方法 */
    menuItemRender: ({ icon, pro_layout_parentKeys, isUrl, path = '', locale }, defaultDom) => {
      const renderMenuDom = () => {
        const isGroup = LAYOUT?.siderMenuType === 'group';
        const isCollapsed = initialState?.Collapsed;
        return (
          <Space size={4}>
            {/* 分组布局不用渲染图标，避免重复 */}
            {!!pro_layout_parentKeys?.length &&
              pro_layout_parentKeys?.length > 0 &&
              renderMenuicon(icon)}
            {!isGroup || (isGroup && !isCollapsed) ? (
              <Paragraph ellipsis={{ rows: 1, tooltip: defaultDom }} style={{ marginBottom: 0 }}>
                {isGroup ? formatMessage({ id: locale as string }) : defaultDom}
              </Paragraph>
            ) : null}
          </Space>
        );
      };
      return (
        /* 渲染二级菜单图标 */
        isUrl ? (
          <a href={path} target="_blank">
            {renderMenuDom()}
          </a>
        ) : (
          <Link to={path || '/'}>{renderMenuDom()}</Link>
        )
      );
    },
    // 自定义拥有子菜单菜单项的 render 方法
    subMenuItemRender: ({ icon, path = '' }) => {
      return !initialState?.Collapsed ? (
        <Space size={4}>
          {renderMenuicon(icon)}
          <span>{formatMessage({ id: formatPerfix(path, '', true) })}</span>
        </Space>
      ) : (
        <div
          style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 40 }}
        >
          {renderMenuicon(icon)}
        </div>
      );
    },
    // 菜单的折叠收起事件
    onCollapse: (collapsed) => {
      setInitialState((s: InitialStateTypes) => ({ ...s, Collapsed: collapsed }));
    },
    // 增加一个 loading 的状态
    childrenRender: (children) => {
      return (
        <>
          <ProConfigProvider>{children}</ProConfigProvider>
        </>
      );
    },
    ...LAYOUT,
  };
};
