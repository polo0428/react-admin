import { Card, Typography } from 'antd';
import React from 'react';

const { Title, Text } = Typography;

interface StatsCardProps {
  title: string;
  value: string;
  subtext: string;
  icon: React.ReactNode;
  colorClass: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, subtext, icon, colorClass }) => {
  return (
    <Card bordered={false} className="shadow-sm rounded-xl hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <Text type="secondary" className="text-gray-500 mb-1 block">
            {title}
          </Text>
          <Title level={2} style={{ margin: '4px 0 8px 0' }}>
            {value}
          </Title>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {subtext}
          </Text>
        </div>
        <div
          className={`p-3 rounded-full text-white text-2xl flex items-center justify-center w-12 h-12 ${colorClass}`}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
};

export default StatsCard;
