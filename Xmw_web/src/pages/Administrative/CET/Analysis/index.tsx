/* eslint-disable complexity */
import {
  ArrowLeftOutlined,
  ReadOutlined,
  RiseOutlined,
  TeamOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { history, useLocation, useRequest } from '@umijs/max';
import { Button, Card, Col, Row, Space, Spin, Tag, Typography } from 'antd';
import React from 'react';

import { getAnalysisDashboard } from '@/services/administrative/cet';

import { ExamBatch } from '../components/CreateExamModal';
import DistributionChart from './components/DistributionChart';
import RadarChart from './components/RadarChart';
import StatsCard from './components/StatsCard';
import TrendChart from './components/TrendChart';

const { Title } = Typography;

const AnalysisPage: React.FC = () => {
  const location = useLocation();
  const state = location.state as { examItem?: ExamBatch };
  const batch = state?.examItem;

  const [data, setData] = React.useState<any>(null);

  const fetchAnalysisData = async () => {
    if (!batch?.id) return null;
    try {
      const res: any = await getAnalysisDashboard({ batch_id: batch.id });
      setData(res.data);
      return res?.data?.data || res?.data || res || {};
    } catch (error) {
      console.error('Fetch analysis data failed:', error);
      return {};
    }
  };

  const { loading } = useRequest(fetchAnalysisData, {
    ready: !!batch?.id,
    refreshDeps: [batch?.id],
  });

  const handleBack = () => {
    history.back();
  };

  if (!batch) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <Typography.Text type="secondary" className="text-lg">
          未找到考次信息，请从考次列表进入
        </Typography.Text>
        <Button type="primary" onClick={handleBack} icon={<ArrowLeftOutlined />}>
          返回考次列表
        </Button>
      </div>
    );
  }

  if (loading && !data) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 p-6">
      {/* 顶部导航和标题 */}
      <div className="flex items-center justify-between mb-6">
        <Space>
          <Button
            type="link"
            onClick={handleBack}
            icon={<ArrowLeftOutlined />}
            style={{ padding: 0 }}
          >
            返回考次列表
          </Button>
        </Space>

        {batch && (
          <Tag color="indigo" className="px-3 py-1 text-sm rounded-full">
            {batch.name}
          </Tag>
        )}
      </div>

      {/* 统计卡片区域 */}
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard
            title="参考总人数"
            value={data?.totalCandidates || '-'}
            subtext={`同比去年 ${data?.totalCandidatesYoY || '-'}`}
            icon={<TeamOutlined />}
            colorClass="bg-blue-500"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard
            title="CET-4 通过率"
            value={data?.cet4PassRate || '-'}
            subtext={`同比去年 ${data?.cet4PassRateYoY || '-'}`}
            icon={<RiseOutlined />}
            colorClass="bg-emerald-500"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard
            title="CET-6 通过率"
            value={data?.cet6PassRate || '-'}
            subtext={`同比去年 ${data?.cet6PassRateYoY || '-'}`}
            icon={<TrophyOutlined />}
            colorClass="bg-indigo-500"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard
            title="平均总分"
            value={data?.avgScore || '-'}
            subtext={`最高分: ${data?.maxScore || '-'}`}
            icon={<ReadOutlined />}
            colorClass="bg-violet-500"
          />
        </Col>
      </Row>

      {/* 图表区域 第一行 */}
      <Row gutter={[24, 24]} className="mt-6">
        <Col xs={24} lg={12}>
          <Card bordered={false} className="shadow-sm rounded-xl">
            <Title level={4} style={{ marginBottom: '24px', fontSize: '18px' }}>
              全校历史通过率趋势
            </Title>
            <div style={{ height: '450px', width: '100%' }}>
              <TrendChart data={data?.trendData} />
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card bordered={false} className="shadow-sm rounded-xl">
            <Title level={4} style={{ marginBottom: '24px', fontSize: '18px' }}>
              单项能力分析 (雷达图)
            </Title>
            <div style={{ height: '450px', width: '100%' }}>
              <RadarChart data={data?.radarData} />
            </div>
          </Card>
        </Col>
      </Row>

      {/* 图表区域 第二行 */}
      <Row gutter={[24, 24]} className="mt-6">
        <Col xs={24} lg={12}>
          <Card className="shadow-sm rounded-xl">
            <Title level={4} style={{ marginBottom: '24px', fontSize: '18px' }}>
              成绩段分布统计 (CET-4)
            </Title>
            <div style={{ height: '350px', width: '100%' }}>
              <DistributionChart data={data?.distributionData} />
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card className="shadow-sm rounded-xl">
            <Title level={4} style={{ marginBottom: '24px', fontSize: '18px' }}>
              成绩段分布统计 (CET-6)
            </Title>
            <div style={{ height: '350px', width: '100%' }}>
              <DistributionChart data={data?.cet6DistributionData} />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AnalysisPage;
