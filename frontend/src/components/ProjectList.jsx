import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { projectsAPI } from '../api/projects';
import { getErrorMessage } from '../utils/errorHandler';
import { useProjects } from '../hooks/useProjects';

function ProjectList() {
  const { projects, loading, error, refetch } = useProjects();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [submitError, setSubmitError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    // 客户端验证
    if (!formData.name || formData.name.trim().length === 0) {
      setSubmitError('项目名称不能为空');
      return;
    }

    if (formData.name.length > 100) {
      setSubmitError('项目名称不能超过100个字符');
      return;
    }

    try {
      const response = await projectsAPI.create(formData.name.trim(), (formData.description || '').trim());
      
      if (!response || !response.data) {
        throw new Error('创建项目返回数据格式错误');
      }

      setProjects([response.data, ...projects]);
      setFormData({ name: '', description: '' });
      setShowForm(false);
      setSubmitError(null);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setSubmitError(errorMessage);
    }
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  if (error) {
    return (
      <div className="card">
        <div className="error">{error}</div>
        <button className="btn btn-primary" onClick={refetch} style={{ marginTop: '1rem' }}>
          重试
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 className="card-title">项目管理</h2>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? '取消' : '创建新项目'}
          </button>
        </div>

        {showForm && (
          <form 
            onSubmit={handleSubmit} 
            className="form-expand"
            style={{ marginBottom: '2rem', padding: '1.5rem 0', borderTop: '1px solid rgba(0, 0, 0, 0.08)', borderBottom: '1px solid rgba(0, 0, 0, 0.08)' }}
          >
            {submitError && (
              <div className="error" style={{ marginBottom: '1rem' }}>
                {submitError}
              </div>
            )}
            <div className="form-group">
              <label className="form-label">项目名称 *</label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  setSubmitError(null);
                }}
                maxLength={100}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">项目描述</label>
              <textarea
                className="form-textarea"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                maxLength={500}
              />
            </div>
            <button type="submit" className="btn btn-primary">创建项目</button>
          </form>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="card empty-state">
          <p style={{ textAlign: 'center', color: '#666' }}>还没有项目，创建一个新项目开始监控吧！</p>
        </div>
      ) : (
        <div className="card">
          <h2 className="card-title">项目列表</h2>
          <table className="table">
            <thead>
              <tr>
                <th>项目名称</th>
                <th>项目 Key</th>
                <th>描述</th>
                <th>创建时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id}>
                  <td>{project.name}</td>
                  <td>
                    <code style={{ background: '#f9f9f9', padding: '0.25rem 0.5rem', border: '1px solid #e5e5e5', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                      {project.key}
                    </code>
                  </td>
                  <td>{project.description || '-'}</td>
                  <td>{new Date(project.created_at).toLocaleString('zh-CN')}</td>
                  <td>
                    <Link to={`/projects/${project.key}`} className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}>
                      查看详情
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ProjectList;

