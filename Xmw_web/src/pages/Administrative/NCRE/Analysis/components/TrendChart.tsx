import ReactECharts from 'echarts-for-react';
import React from 'react';

interface Props {
  data?: {
    batchName: string;
    cet4PassRate: number;
    cet6PassRate: number;
  }[];
}

/**
 * 全校历史通过率趋势图表 (Line Chart)
 * 展示CET-4和CET-6的通过率走势
 */
const TrendChart: React.FC<Props> = ({ data = [] }) => {
  const getOption = () => {
    return {
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#fff',
        borderColor: '#eee',
        borderWidth: 1,
        textStyle: { color: '#333' },
      },
      legend: {
        data: ['CET-4 通过率 (%)', 'CET-6 通过率 (%)'],
        top: 0,
        icon: 'circle',
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
        boundaryGap: false,
        data: data.map((item) => item.batchName),
        axisLine: { lineStyle: { color: '#94a3b8' } },
        axisLabel: { color: '#64748b', interval: 0 },
      },
      yAxis: {
        type: 'value',
        max: 100,
        name: '通过率(%)',
        nameTextStyle: {
          align: 'right',
          padding: [0, 0, 0, 20],
        },
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { type: 'dashed', color: '#f0f0f0' } },
        axisLabel: { color: '#64748b' },
      },
      series: [
        {
          name: 'CET-4 通过率 (%)',
          type: 'line',
          data: data.map((item) => item.cet4PassRate),
          smooth: true,
          showSymbol: true,
          symbolSize: 8,
          itemStyle: { color: '#10b981' },
          lineStyle: { width: 3 },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(16, 185, 129, 0.2)' },
                { offset: 1, color: 'rgba(16, 185, 129, 0)' },
              ],
            },
          },
        },
        {
          name: 'CET-6 通过率 (%)',
          type: 'line',
          data: data.map((item) => item.cet6PassRate),
          smooth: true,
          itemStyle: { color: '#6366f1' },
          lineStyle: { width: 3 },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(99, 102, 241, 0.2)' },
                { offset: 1, color: 'rgba(99, 102, 241, 0)' },
              ],
            },
          },
        },
      ],
    };
  };

  return <ReactECharts option={getOption()} style={{ height: '100%', width: '100%' }} />;
};

export default TrendChart;
