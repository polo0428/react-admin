import { LeftOutlined } from '@ant-design/icons';
import { useLocation } from '@umijs/max';
import { Button, Card, message, Result, Typography } from 'antd';
import React, { useState } from 'react';

import Uploader from '@/components/BatchImport/Uploader';
import { importCetRegistration } from '@/services/administrative/ncre';
import { navigateWithMenuParam } from '@/utils';

import { ExamBatch } from '../components/CreateExamModal';

const { Text } = Typography;

const ImportRegistration: React.FC = () => {
  const location = useLocation();
  const state = location.state as { examItem?: ExamBatch } | undefined;
  const examItem = state?.examItem;
  const [successCount, setSuccessCount] = useState<number | null>(null);

  const handleBack = () => {
    navigateWithMenuParam('/ncre');
  };

  const handleGoToRegistrations = () => {
    navigateWithMenuParam('/ncre/registrations', { examItem });
  };

  const handleImport = async (formData: FormData) => {
    if (!examItem?.id) {
      message.error('考次信息丢失，请返回重新进入');
      throw new Error('No exam item');
    }
    formData.append('batch_id', examItem.id);
    const res = await importCetRegistration(formData);
    const data = (res as any)?.data || {};
    const created = Number(data.created || 0);
    const updated = Number(data.updated || 0);
    const count = created + updated || Number(data.count || 0) || Number(data.total || 0) || 0;
    setSuccessCount(count);
    return res;
  };

  return (
    <div>
      <Card
        title={
          <div className="flex items-center gap-2">
            <Button icon={<LeftOutlined />} type="text" onClick={handleBack} />
            <span>导入报名数据 {examItem && `- ${examItem.name}`}</span>
          </div>
        }
      >
        {typeof successCount === 'number' ? (
          <Result
            status="success"
            title={`成功导入${successCount}人`}
            extra={
              <Button type="primary" onClick={handleGoToRegistrations}>
                返回查看
              </Button>
            }
          />
        ) : (
          <div className="flex flex-col gap-6">
            <div className="mb-4">
              <Text type="secondary">
                请下载模板，按照模板格式填写报名信息后上传。支持 Excel 文件格式。
              </Text>
            </div>

            <Uploader
              run={handleImport}
              filename="NCRE报名导入模板.xlsx"
              url="/template/ncre_registration_template.xlsx"
              downloadName="下载NCRE报名模板"
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default ImportRegistration;
