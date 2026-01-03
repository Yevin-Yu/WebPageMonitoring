import React from 'react';
import ReactECharts from 'echarts-for-react';

export function PieChart({ data, title }) {
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
      trigger: 'item',
    },
    series: [
      {
        type: 'pie',
        radius: '60%',
        data: data || [],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 1,
        },
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: '300px' }} />;
}


