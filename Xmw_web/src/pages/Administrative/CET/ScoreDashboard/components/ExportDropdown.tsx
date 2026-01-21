import { DownloadOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import React from 'react';

/**
 * 导出按钮
 * - onExport: 导出数据
 */
export default function ExportDropdown(props: { onExport: () => void }) {
  const { onExport } = props;

  return (
    <Button type="primary" icon={<DownloadOutlined />} onClick={onExport}>
      导出数据
    </Button>
  );
}
