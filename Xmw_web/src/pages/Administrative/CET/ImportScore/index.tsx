import { LeftOutlined } from '@ant-design/icons';
import { history, useLocation } from '@umijs/max';
import { Button, Card, message, Result, Typography } from 'antd';
import React, { useState } from 'react';

import Uploader from '@/components/BatchImport/Uploader';
import { importCetScore } from '@/services/administrative/cet';

import { ExamBatch } from '../components/CreateExamModal';

const { Text } = Typography;

const ImportScore: React.FC = () => {
  const location = useLocation();
  const state = location.state as { examItem?: ExamBatch } | undefined;
  const examItem = state?.examItem;
  const [successCount, setSuccessCount] = useState<number | null>(null);

  const handleBack = () => {
    history.push('/cet');
  };

  const handleImport = async (formData: FormData) => {
    if (!examItem?.id) {
      message.error('考次信息丢失，请返回重新进入');
      throw new Error('No exam item');
    }
    formData.append('batch_id', examItem.id);
    const res = await importCetScore(formData);
    const data = (res as any)?.data || {};
    const created = Number(data.created || 0);
    const updated = Number(data.updated || 0);
    const count = created + updated || Number(data.count || 0) || Number(data.total || 0) || 0;
    setSuccessCount(count);
    return res;
  };

  const handleGoToScores = () => {
    history.push('/cet/scores', { examItem });
  };

  return (
    <div>
      <Card
        title={
          <div className="flex items-center gap-2">
            <Button icon={<LeftOutlined />} type="text" onClick={handleBack} />
            <span>导入成绩数据 {examItem && `- ${examItem.name}`}</span>
          </div>
        }
      >
        {typeof successCount === 'number' ? (
          <Result
            status="success"
            title={`成功导入${successCount}人`}
            extra={
              <Button type="primary" onClick={handleGoToScores}>
                返回查看
              </Button>
            }
          />
        ) : (
          <div className="flex flex-col gap-6">
            <div className="mb-4">
              <Text type="secondary">
                请下载模板，按照模板格式填写成绩信息后上传。支持 Excel 文件格式。
              </Text>
            </div>

            <Uploader
              run={handleImport}
              filename="CET成绩导入模板.xlsx"
              url="/template/cet_score_template.xlsx"
              downloadName="下载CET成绩模板"
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default ImportScore;
