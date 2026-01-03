import React from 'react';
import ReactECharts from 'echarts-for-react';

export function BarChart({ data, title }) {
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
      data: data?.map(item => item.name) || [],
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        type: 'bar',
        data: data?.map(item => item.value) || [],
        itemStyle: {
          color: '#333',
        },
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: '300px' }} />;
}


