import React, { useState, useEffect } from 'react';
import Dashboard from './Dashboard';
import EventList from './EventList';
import RealtimeDashboard from './RealtimeDashboard';
import { useProjects } from '../hooks/useProjects';
import ProjectSelector from './common/ProjectSelector';

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

  const handleProjectChange = (projectKey) => {
    setSelectedProjectKey(projectKey);
    setActiveTab('dashboard');
  };

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
    <div style={{ maxWidth: '100%', overflowX: 'hidden' }}>
      <div className="card">
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 className="card-title" style={{ marginBottom: '1rem' }}>项目监控</h2>
          <ProjectSelector
            projects={projects}
            selectedKey={selectedProjectKey}
            onChange={handleProjectChange}
          />
        </div>

        {selectedProject && (
          <div style={{
            padding: '1rem',
            background: 'rgba(0, 0, 0, 0.02)',
            borderRadius: '6px',
            border: '1px solid rgba(0, 0, 0, 0.08)'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.25rem' }}>项目名称</div>
                <div style={{ fontSize: '0.875rem', color: '#1a1a1a', fontWeight: 500 }}>{selectedProject.name}</div>
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
                  background: 'rgba(0, 0, 0, 0.06)',
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
        <div className="card" style={{ overflowX: 'hidden' }}>
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
