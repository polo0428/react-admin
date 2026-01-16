import {
  LineChartOutlined,
  PercentageOutlined,
  TeamOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { Card, Col, Row, Typography } from 'antd';
import React from 'react';

import { ScoreStatsData } from './types';

const { Text } = Typography;

interface ScoreStatsProps {
  stats: ScoreStatsData;
}

/**
 * 成绩统计卡片组件
 * 展示参考人数、通过率、平均分、最高分等统计信息
 */
const ScoreStats: React.FC<ScoreStatsProps> = ({ stats }) => {
  return (
    <Row gutter={[16, 16]}>
      <Col xs={12} md={6}>
        <Card bodyStyle={{ padding: '16px' }}>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
              <TeamOutlined className="text-xl" />
            </div>
            <div>
              <Text type="secondary" className="text-xs font-medium block">
                参考人数
              </Text>
              <Text strong className="text-xl">
                {stats?.total}
              </Text>
            </div>
          </div>
        </Card>
      </Col>
      <Col xs={12} md={6}>
        <Card bodyStyle={{ padding: '16px' }}>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
              <PercentageOutlined className="text-xl" />
            </div>
            <div>
              <Text type="secondary" className="text-xs font-medium block">
                通过率
              </Text>
              <Text strong className="text-xl">
                {stats?.passRate}%
              </Text>
            </div>
          </div>
        </Card>
      </Col>
      <Col xs={12} md={6}>
        <Card bodyStyle={{ padding: '16px' }}>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
              <LineChartOutlined className="text-xl" />
            </div>
            <div>
              <Text type="secondary" className="text-xs font-medium block">
                平均分
              </Text>
              <Text strong className="text-xl">
                {stats?.avgScore}
              </Text>
            </div>
          </div>
        </Card>
      </Col>
      <Col xs={12} md={6}>
        <Card bodyStyle={{ padding: '16px' }}>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
              <TrophyOutlined className="text-xl" />
            </div>
            <div>
              <Text type="secondary" className="text-xs font-medium block">
                最高分
              </Text>
              <Text strong className="text-xl">
                {stats?.maxScore}
              </Text>
            </div>
          </div>
        </Card>
      </Col>
    </Row>
  );
};

export default ScoreStats;
