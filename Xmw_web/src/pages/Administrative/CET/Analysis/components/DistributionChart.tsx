import ReactECharts from 'echarts-for-react';
import React from 'react';

import { MOCK_DISTRIBUTION_DATA } from '../constants';

/**
 * 成绩段分布统计图表 (Bar Chart)
 * 展示各分数段的人数分布
 */
const DistributionChart: React.FC = () => {
  const getOption = () => {
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '15%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: MOCK_DISTRIBUTION_DATA.map((item) => item.range),
        axisLine: { lineStyle: { color: '#94a3b8' } },
        axisLabel: { color: '#64748b' },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value',
        name: '人数',
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { type: 'dashed', color: '#f0f0f0' } },
        axisLabel: { color: '#64748b' },
      },
      series: [
        {
          name: '人数',
          type: 'bar',
          barWidth: '40%',
          data: MOCK_DISTRIBUTION_DATA.map((item) => item.count),
          itemStyle: {
            color: '#3b82f6',
            borderRadius: [4, 4, 0, 0],
          },
          label: {
            show: true,
            position: 'top',
            color: '#64748b',
          },
        },
      ],
    };
  };

  return <ReactECharts option={getOption()} style={{ height: '100%', width: '100%' }} />;
};

export default DistributionChart;
