import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectsAPI } from '../api/projects';
import { getErrorMessage } from '../utils/errorHandler';

function ProjectDetail() {
  const { projectKey } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

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

  const getPluginUrl = () => {
    // 获取当前页面的协议和主机
    const protocol = window.location.protocol;
    const host = window.location.hostname;
    const port = window.location.port;
    const baseUrl = port ? `${protocol}//${host}:${port}` : `${protocol}//${host}`;
    return `${baseUrl}/plugin/monitoring.js`;
  };

  const getApiUrl = () => {
    // 生产环境：使用同域地址（Nginx 反向代理处理 /api/ 路径）
    // 开发环境：使用带端口的地址
    const protocol = window.location.protocol;
    const host = window.location.hostname;
    const port = window.location.port;
    
    // 判断是否为生产环境（通过端口判断，生产环境通常没有端口或使用标准端口）
    const isProduction = !port || port === '80' || port === '443' || window.location.hostname !== 'localhost';
    
    if (isProduction) {
      // 生产环境：使用同域地址，Nginx 会处理 /api/ 路径的反向代理
      return port ? `${protocol}//${host}:${port}` : `${protocol}//${host}`;
    } else {
      // 开发环境：使用带端口的后端地址
      return `${protocol}//${host}:3002`;
    }
  };

  const handleCopyCode = async () => {
    const embedCode = getEmbedCode();
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
    }
  };

  const getEmbedCode = () => {
    const pluginUrl = getPluginUrl();
    const apiUrl = getApiUrl();
    
    return `<script>
  (function() {
    var script = document.createElement('script');
    script.src = '${pluginUrl}';
    script.onload = function() {
      window.WebPageMonitoring.init({
        apiUrl: '${apiUrl}',
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

  const embedCode = getEmbedCode();

  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 className="card-title" style={{ marginBottom: '0.5rem' }}>{project.name}</h2>
            {project.description && (
              <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>{project.description}</p>
            )}
          </div>
          <button className="btn" onClick={() => navigate('/')}>
            返回列表
          </button>
        </div>

        <div style={{ 
          padding: '1.5rem', 
          background: 'rgba(102, 126, 234, 0.05)', 
          borderRadius: '12px', 
          marginBottom: '2rem',
          border: '1px solid rgba(102, 126, 234, 0.1)'
        }}>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem', fontWeight: 500 }}>
              项目 Key
            </div>
            <code className="code-block" style={{ 
              display: 'block',
              padding: '0.75rem 1rem',
              background: 'white',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontFamily: 'monospace',
              wordBreak: 'break-all'
            }}>
              {project.key}
            </code>
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1e293b', margin: 0 }}>
              嵌入代码
            </h3>
            <button 
              className={`btn ${copied ? 'btn-primary' : ''}`}
              onClick={handleCopyCode}
              style={{ fontSize: '0.875rem' }}
            >
              {copied ? '✓ 已复制' : '📋 复制代码'}
            </button>
          </div>
          
          <div style={{ 
            padding: '1.25rem', 
            background: 'rgba(15, 23, 42, 0.05)', 
            borderRadius: '12px',
            border: '1px solid rgba(0, 0, 0, 0.06)',
            position: 'relative'
          }}>
            <p style={{ 
              color: '#64748b', 
              fontSize: '0.875rem', 
              marginBottom: '1rem',
              lineHeight: '1.6'
            }}>
              将以下代码添加到你的网站 HTML 中（通常在 <code style={{ 
                background: 'rgba(0, 0, 0, 0.05)', 
                padding: '0.125rem 0.375rem', 
                borderRadius: '4px',
                fontSize: '0.8em'
              }}>&lt;/head&gt;</code> 之前）:
            </p>
            <div style={{ 
              marginBottom: '1rem', 
              padding: '0.75rem', 
              background: 'rgba(59, 130, 246, 0.1)', 
              borderRadius: '6px',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              fontSize: '0.8125rem',
              color: '#1e40af'
            }}>
              <strong>💡 部署提示：</strong> 代码中的 apiUrl 已自动适配当前环境。
              {window.location.hostname === 'localhost' 
                ? ' 开发环境使用端口 3002，生产环境将自动使用同域地址。'
                : ' 生产环境使用同域地址，Nginx 会处理 API 请求的反向代理。'}
            </div>
            <pre className="code-block" style={{ 
              whiteSpace: 'pre-wrap', 
              wordBreak: 'break-all',
              margin: 0,
              padding: '1.25rem',
              background: '#1e293b',
              color: '#e2e8f0',
              borderRadius: '8px',
              fontSize: '0.875rem',
              lineHeight: '1.6',
              overflow: 'auto',
              maxHeight: '400px'
            }}>
              {embedCode}
            </pre>
          </div>

          <div style={{ 
            marginTop: '1.5rem', 
            padding: '1rem', 
            background: 'rgba(34, 197, 94, 0.1)', 
            borderRadius: '8px',
            border: '1px solid rgba(34, 197, 94, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.25rem' }}>💡</span>
              <div>
                <div style={{ fontWeight: 600, color: '#16a34a', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  使用说明
                </div>
                <ul style={{ 
                  margin: 0, 
                  paddingLeft: '1.25rem', 
                  color: '#64748b', 
                  fontSize: '0.875rem',
                  lineHeight: '1.8'
                }}>
                  <li>将代码复制到你的网站 HTML 的 <code style={{ 
                    background: 'rgba(0, 0, 0, 0.05)', 
                    padding: '0.125rem 0.375rem', 
                    borderRadius: '4px',
                    fontSize: '0.8em'
                  }}>&lt;/head&gt;</code> 标签之前</li>
                  <li>代码会自动加载监控脚本并开始收集数据</li>
                  <li>你可以在"项目监控"页面查看收集到的数据</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectDetail;

