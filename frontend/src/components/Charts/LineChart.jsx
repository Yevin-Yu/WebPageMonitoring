import React from 'react';
import ReactECharts from 'echarts-for-react';

export function LineChart({ data, title, xKey = 'time', yKeys = ['value'], colors = ['#1a1a1a', '#666', '#999'] }) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
        暂无数据
      </div>
    );
  }

  const series = yKeys.map((key, index) => ({
    name: key === 'pageviews' ? '页面访问' : 
          key === 'clicks' ? '点击事件' : 
          key === 'visitors' ? '访客数' : 
          key === 'errors' ? '错误数' : key,
    type: 'line',
    smooth: true,
    data: data?.map(item => item[key] || 0) || [],
    itemStyle: {
      color: colors[index % colors.length],
    },
    areaStyle: index === 0 ? {
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
    } : undefined,
  }));

  const option = {
    title: title ? {
      text: title,
      left: 'center',
      textStyle: {
        fontSize: 14,
        fontWeight: 400,
        color: '#333',
      },
    } : undefined,
    tooltip: {
      trigger: 'axis',
    },
    legend: yKeys.length > 1 ? {
      data: series.map(s => s.name),
      bottom: 0,
    } : undefined,
    grid: {
      left: '3%',
      right: '4%',
      bottom: yKeys.length > 1 ? '15%' : '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data?.map(item => item[xKey]) || [],
    },
    yAxis: {
      type: 'value',
    },
    series,
  };

  return <ReactECharts option={option} style={{ height: '300px' }} />;
}


