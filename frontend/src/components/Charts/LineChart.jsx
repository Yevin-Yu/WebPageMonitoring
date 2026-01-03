import React from 'react';
import ReactECharts from 'echarts-for-react';

export function LineChart({ data, title }) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
        暂无数据
      </div>
    );
  }

  const option = {
    title: {
      text: title,
      left: 'center',
      textStyle: {
        fontSize: 14,
        fontWeight: 400,
        color: '#333',
      },
    },
    tooltip: {
      trigger: 'axis',
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data?.map(item => item.time) || [],
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: '访问量',
        type: 'line',
        smooth: true,
        data: data?.map(item => item.value) || [],
        itemStyle: {
          color: '#333',
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(0, 0, 0, 0.1)' },
              { offset: 1, color: 'rgba(0, 0, 0, 0)' },
            ],
          },
        },
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: '300px' }} />;
}


