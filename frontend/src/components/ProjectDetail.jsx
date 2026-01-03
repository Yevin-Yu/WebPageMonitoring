import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectsAPI } from '../api/projects';
import { getErrorMessage } from '../utils/errorHandler';
import CodeEmbed from './common/CodeEmbed';

function ProjectDetail() {
  const { projectKey } = useParams();
  const navigate = useNavigate();
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

      if (!response?.data || !Array.isArray(response.data)) {
        throw new Error('返回数据格式错误');
      }

      const found = response.data.find(p => p?.key === projectKey);

      if (!found) {
        setError('项目不存在');
        return;
      }

      setProject(found);
    } catch (err) {
      setError(getErrorMessage(err));
      console.error('加载项目信息失败:', err);
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

  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 className="card-title" style={{ marginBottom: '0.5rem' }}>{project.name}</h2>
            {project.description && (
              <p style={{ color: '#666', fontSize: '0.875rem', margin: 0 }}>{project.description}</p>
            )}
          </div>
          <button className="btn" onClick={() => navigate('/')}>
            返回列表
          </button>
        </div>

        <div style={{
          padding: '1.5rem',
          background: 'rgba(0, 0, 0, 0.02)',
          borderRadius: '6px',
          marginBottom: '1.5rem',
          border: '1px solid rgba(0, 0, 0, 0.08)'
        }}>
          <div style={{ marginBottom: '0.5rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.5rem', fontWeight: 500 }}>
              项目 Key
            </div>
            <code style={{
              display: 'block',
              padding: '0.75rem 1rem',
              background: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '4px',
              fontSize: '0.875rem',
              fontFamily: 'monospace',
              wordBreak: 'break-all',
              border: '1px solid rgba(0, 0, 0, 0.08)'
            }}>
              {project.key}
            </code>
          </div>
        </div>

        <CodeEmbed projectKey={project.key} projectName={project.name} />
      </div>
    </div>
  );
}

export default ProjectDetail;

