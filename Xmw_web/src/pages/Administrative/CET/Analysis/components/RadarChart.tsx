import ReactECharts from 'echarts-for-react';
import React from 'react';

import { MOCK_SKILL_DATA } from '../constants';

/**
 * 单项能力分析图表 (Radar Chart)
 * 对比本批次与上批次的各项能力得分
 */
const RadarChart: React.FC = () => {
  const getOption = () => {
    return {
      tooltip: {
        trigger: 'item',
      },
      legend: {
        data: ['本批次平均', '上批次平均'],
        top: 0,
        icon: 'circle',
      },
      radar: {
        indicator: MOCK_SKILL_DATA.map((item) => ({
          name: item.subject,
          max: 250,
        })),
        radius: '70%',
        center: ['50%', '60%'],
        splitNumber: 4,
        axisName: {
          color: '#64748b',
          padding: [3, 5],
        },
        splitLine: {
          lineStyle: {
            color: '#e2e8f0',
          },
        },
        splitArea: {
          show: false,
        },
      },
      series: [
        {
          name: '能力分析',
          type: 'radar',
          data: [
            {
              value: MOCK_SKILL_DATA.map((item) => item.A),
              name: '本批次平均',
              itemStyle: { color: '#8b5cf6' },
              areaStyle: { color: '#8b5cf6', opacity: 0.5 },
              lineStyle: { width: 2 },
            },
            {
              value: MOCK_SKILL_DATA.map((item) => item.B),
              name: '上批次平均',
              itemStyle: { color: '#cbd5e1' },
              areaStyle: { color: '#cbd5e1', opacity: 0.3 },
              lineStyle: { width: 2 },
            },
          ],
        },
      ],
    };
  };

  return <ReactECharts option={getOption()} style={{ height: '100%', width: '100%' }} />;
};

export default RadarChart;
