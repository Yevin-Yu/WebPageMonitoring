import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectsAPI } from '../api/projects';
import Dashboard from './Dashboard';
import EventList from './EventList';
import { getErrorMessage } from '../utils/errorHandler';

function ProjectDetail() {
  const { projectKey } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (projectKey) {
      loadProject();
    } else {
      setError('项目Key无效');
      setLoading(false);
    }
  }, [projectKey]);

  const loadProject = async () => {
    try {
      setError(null);
      setLoading(true);

      const response = await projectsAPI.list();
      
      if (!response || !response.data || !Array.isArray(response.data)) {
        throw new Error('返回数据格式错误');
      }

      const found = response.data.find(p => p && p.key === projectKey);
      
      if (!found) {
        setError('项目不存在');
        return;
      }

      setProject(found);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      console.error('加载项目信息失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  if (error) {
    return (
      <div className="card">
        <div className="error">{error}</div>
        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-primary" onClick={loadProject}>
            重试
          </button>
          <button className="btn" onClick={() => navigate('/')}>
            返回列表
          </button>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="card">
        <div className="error">项目不存在</div>
        <button className="btn" onClick={() => navigate('/')} style={{ marginTop: '1rem' }}>
          返回列表
        </button>
      </div>
    );
  }

  const embedCode = `<script>
  (function() {
    var script = document.createElement('script');
    script.src = 'http://localhost:3000/plugin/monitoring.js';
    script.onload = function() {
      window.WebPageMonitoring.init({
        apiUrl: 'http://localhost:3001',
        projectKey: '${projectKey}',
        autoTrack: true,
        trackPageView: true,
        trackClick: true,
        trackError: true,
        trackPerformance: true
      });
    };
    document.head.appendChild(script);
  })();
</script>`;

  return (
    <div>
      <div className="card">
        <h2 className="card-title">{project.name}</h2>
        <p style={{ color: '#666', marginBottom: '1rem' }}>{project.description || '无描述'}</p>
        
        <div style={{ marginBottom: '1rem' }}>
          <strong>项目 Key:</strong>
          <code className="code-block">{project.key}</code>
        </div>

        <div>
          <strong>嵌入代码:</strong>
          <p style={{ color: '#666', fontSize: '0.875rem', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
            将以下代码添加到你的网站 HTML 中（通常在 &lt;/head&gt; 之前）:
          </p>
          <pre className="code-block" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {embedCode}
          </pre>
        </div>
      </div>

      <div className="card">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            数据概览
          </button>
          <button
            className={`tab ${activeTab === 'events' ? 'active' : ''}`}
            onClick={() => setActiveTab('events')}
          >
            事件列表
          </button>
        </div>

        {activeTab === 'dashboard' && <Dashboard projectKey={projectKey} />}
        {activeTab === 'events' && <EventList projectKey={projectKey} />}
      </div>
    </div>
  );
}

export default ProjectDetail;

