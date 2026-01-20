import React from 'react';
import { DownOutlined, DownloadOutlined, FileExcelOutlined, FileTextOutlined } from '@ant-design/icons';
import { Button, Dropdown, MenuProps } from 'antd';

/**
 * 导出按钮（Hover 菜单）
 * - onExportDetailed: 导出明细
 * - onExportStats: 导出统计
 */
export default function ExportDropdown(props: {
  onExportDetailed: () => void;
  onExportStats: () => void;
}) {
  const { onExportDetailed, onExportStats } = props;

  const items: MenuProps['items'] = [
    {
      key: 'detailed',
      label: '导出当前页明细',
      icon: <FileTextOutlined />,
      onClick: onExportDetailed,
    },
    {
      key: 'stats',
      label: '导出成绩统计',
      icon: <FileExcelOutlined />,
      onClick: onExportStats,
    },
  ];

  return (
    <Dropdown menu={{ items }} placement="bottomRight">
      <Button type="primary" icon={<DownloadOutlined />}>
        导出数据 <DownOutlined className="text-xs ml-1" />
      </Button>
    </Dropdown>
  );
}
