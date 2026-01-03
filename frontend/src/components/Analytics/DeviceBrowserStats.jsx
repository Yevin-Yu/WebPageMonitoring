import React from 'react';
import { PieChart } from '../Charts/PieChart';
import { BarChart } from '../Charts/BarChart';

function DeviceBrowserStats({ devices, browsers, os }) {
  const deviceData = Object.entries(devices || {}).map(([name, value]) => ({
    name: name === 'desktop' ? '桌面' : name === 'mobile' ? '移动端' : name === 'tablet' ? '平板' : name,
    value,
  }));

  const browserData = Object.entries(browsers || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([name, value]) => ({ name, value }));

  const osData = Object.entries(os || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([name, value]) => ({ name, value }));

  return (
    <div className="charts-grid">
      <div className="chart-card">
        <PieChart data={deviceData} title="设备类型分布" />
      </div>
      <div className="chart-card">
        <BarChart data={browserData} title="浏览器分布 TOP 10" />
      </div>
      <div className="chart-card">
        <BarChart data={osData} title="操作系统分布 TOP 10" />
      </div>
    </div>
  );
}

export default DeviceBrowserStats;

