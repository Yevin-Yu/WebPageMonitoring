import React, { useState, useEffect, useMemo } from 'react';
import Dashboard from './Dashboard';
import EventList from './EventList';
import RealtimeDashboard from './RealtimeDashboard';
import UserPaths from './Analytics/UserPaths';
import ConversionFunnel from './Analytics/ConversionFunnel';
import RegionStats from './Analytics/RegionStats';
import WebVitals from './Analytics/WebVitals';
import DeviceBrowserStats from './Analytics/DeviceBrowserStats';
import ErrorAnalysis from './Analytics/ErrorAnalysis';
import { useProjects } from '../hooks/useProjects';
import { TIME_RANGES } from '../utils/constants';

function ProjectMonitoring() {
  const { projects, loading, error } = useProjects();
  const [selectedProjectKey, setSelectedProjectKey] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [timeRange, setTimeRange] = useState('24h');

  useEffect(() => {
    if (projects.length > 0 && !selectedProjectKey) {
      setSelectedProjectKey(projects[0].key);
    }
  }, [projects, selectedProjectKey]);

  const handleProjectChange = (e) => {
    setSelectedProjectKey(e.target.value);
    // 切换项目时重置到数据概览标签页
    setActiveTab('dashboard');
  };

  const timeRangeData = useMemo(() => {
    const now = new Date();
    const timeRangeConfig = TIME_RANGES[timeRange];
    const startTime = timeRangeConfig
      ? new Date(now.getTime() - timeRangeConfig.value).toISOString()
      : null;
    return { startTime, endTime: now.toISOString() };
  }, [timeRange]);

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  if (error && projects.length === 0) {
    return (
      <div className="card">
        <div className="error">{error}</div>
      </div>
    );
  }

  const selectedProject = projects.find(p => p.key === selectedProjectKey);

  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <h2 className="card-title" style={{ marginBottom: 0 }}>项目监控</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <label style={{ fontSize: '0.875rem', color: '#666', fontWeight: 400 }}>选择项目:</label>
            <select
              className="form-input"
              value={selectedProjectKey}
              onChange={handleProjectChange}
              style={{ width: 'auto', minWidth: '250px', cursor: 'pointer' }}
            >
              {projects.map((project) => (
                <option key={project.key} value={project.key}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedProject && (
          <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '8px', border: '1px solid #d0d0d0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.25rem' }}>项目名称</div>
                <div style={{ fontSize: '0.875rem', color: '#333', fontWeight: 500 }}>{selectedProject.name}</div>
              </div>
              {selectedProject.description && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.25rem' }}>项目描述</div>
                  <div style={{ fontSize: '0.875rem', color: '#666' }}>{selectedProject.description}</div>
                </div>
              )}
              <div>
                <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.25rem' }}>项目 Key</div>
                <code style={{ 
                  background: '#e0e0e0', 
                  padding: '0.25rem 0.5rem', 
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  fontFamily: 'monospace',
                  display: 'inline-block'
                }}>
                  {selectedProject.key}
                </code>
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedProjectKey && (
        <div className="card">
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              数据概览
            </button>
            <button
              className={`tab ${activeTab === 'realtime' ? 'active' : ''}`}
              onClick={() => setActiveTab('realtime')}
            >
              实时监控
            </button>
            <button
              className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              行为分析
            </button>
            <button
              className={`tab ${activeTab === 'events' ? 'active' : ''}`}
              onClick={() => setActiveTab('events')}
            >
              事件列表
            </button>
          </div>

          {activeTab === 'dashboard' && (
            <div>
              <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                <div className="time-range-selector">
                  <button
                    className={`time-btn ${timeRange === '24h' ? 'active' : ''}`}
                    onClick={() => setTimeRange('24h')}
                  >
                    24小时
                  </button>
                  <button
                    className={`time-btn ${timeRange === '7d' ? 'active' : ''}`}
                    onClick={() => setTimeRange('7d')}
                  >
                    7天
                  </button>
                  <button
                    className={`time-btn ${timeRange === '30d' ? 'active' : ''}`}
                    onClick={() => setTimeRange('30d')}
                  >
                    30天
                  </button>
                </div>
              </div>
              <Dashboard projectKey={selectedProjectKey} timeRange={timeRange} />
            </div>
          )}
          {activeTab === 'realtime' && <RealtimeDashboard projectKey={selectedProjectKey} />}
          {activeTab === 'analytics' && (
            <div>
              <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                <div className="time-range-selector">
                  <button
                    className={`time-btn ${timeRange === '24h' ? 'active' : ''}`}
                    onClick={() => setTimeRange('24h')}
                  >
                    24小时
                  </button>
                  <button
                    className={`time-btn ${timeRange === '7d' ? 'active' : ''}`}
                    onClick={() => setTimeRange('7d')}
                  >
                    7天
                  </button>
                  <button
                    className={`time-btn ${timeRange === '30d' ? 'active' : ''}`}
                    onClick={() => setTimeRange('30d')}
                  >
                    30天
                  </button>
                </div>
              </div>
              <UserPaths projectKey={selectedProjectKey} startTime={timeRangeData.startTime} endTime={timeRangeData.endTime} />
              <ConversionFunnel projectKey={selectedProjectKey} startTime={timeRangeData.startTime} endTime={timeRangeData.endTime} />
              <RegionStats projectKey={selectedProjectKey} startTime={timeRangeData.startTime} endTime={timeRangeData.endTime} />
            </div>
          )}
          {activeTab === 'events' && <EventList projectKey={selectedProjectKey} />}
        </div>
      )}

      {!selectedProjectKey && projects.length > 0 && (
        <div className="card">
          <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
            请选择一个项目查看监控数据
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectMonitoring;

