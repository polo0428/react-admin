import { DownloadOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
// eslint-disable-next-line no-duplicate-imports
import { Button, Dropdown } from 'antd';
import React from 'react';

/**
 * 导出下拉
 * - onExportStats: 导出统计表
 * - onExportDetailed: 导出详细成绩表
 */
export default function ExportDropdown(props: {
  onExport?: () => void;
  onExportStats?: () => void;
  onExportDetailed?: () => void;
}) {
  const { onExport, onExportStats, onExportDetailed } = props;

  // 1. 如果有单一导出回调，直接渲染普通按钮
  if (onExport) {
    return (
      <Button type="primary" icon={<DownloadOutlined />} onClick={onExport}>
        导出数据
      </Button>
    );
  }

  // 2. 如果是统计+明细模式，渲染下拉菜单
  const items: MenuProps['items'] = [
    { key: 'stats', label: '导出统计表' },
    { key: 'detailed', label: '导出详细成绩表' },
  ];

  const onClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'stats' && onExportStats) onExportStats();
    if (key === 'detailed' && onExportDetailed) onExportDetailed();
  };

  return (
    <Dropdown menu={{ items, onClick }} placement="bottomRight">
      <Button type="primary" icon={<DownloadOutlined />}>
        导出
      </Button>
    </Dropdown>
  );
}
