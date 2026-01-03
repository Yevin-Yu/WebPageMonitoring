import React from 'react';
import PropTypes from 'prop-types';
import ReactECharts from 'echarts-for-react';
import { CHART_CONFIG, UI_TEXT } from '../../utils/constants';

export function LineChart({ data, title, xKey, yKeys, colors }) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div style={{ height: `${CHART_CONFIG.HEIGHT.DEFAULT}px`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
        {UI_TEXT.NO_DATA}
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

  return <ReactECharts option={option} style={{ height: `${CHART_CONFIG.HEIGHT.DEFAULT}px` }} />;
}

LineChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  title: PropTypes.string,
  xKey: PropTypes.string,
  yKeys: PropTypes.arrayOf(PropTypes.string),
  colors: PropTypes.arrayOf(PropTypes.string),
};

LineChart.defaultProps = {
  title: '',
  xKey: 'time',
  yKeys: ['value'],
  colors: [CHART_CONFIG.COLORS.PRIMARY, CHART_CONFIG.COLORS.SECONDARY, CHART_CONFIG.COLORS.TERTIARY],
};


