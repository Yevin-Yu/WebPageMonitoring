import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../../api/analytics';
import { getErrorMessage } from '../../utils/errorHandler';

function ConversionFunnel({ projectKey, startTime, endTime }) {
  const [funnel, setFunnel] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [steps, setSteps] = useState([
    { name: '首页', type: 'pageview', url: '/' },
    { name: '产品页', type: 'pageview', url: '/product' },
    { name: '提交', type: 'click', url: '' },
  ]);

  const handleAddStep = () => {
    setSteps([...steps, { name: '', type: 'pageview', url: '' }]);
  };

  const handleStepChange = (index, field, value) => {
    const newSteps = [...steps];
    newSteps[index][field] = value;
    setSteps(newSteps);
  };

  const handleRemoveStep = (index) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const loadFunnel = async () => {
    if (steps.length < 2) {
      setError('至少需要2个转化步骤');
      return;
    }

    try {
      setError(null);
      setLoading(true);
      const response = await analyticsAPI.getConversionFunnel(projectKey, steps, startTime, endTime);
      if (!response || !response.data) {
        throw new Error('返回数据格式错误');
      }
      setFunnel(response.data);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      console.error('加载转化漏斗失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const maxCount = funnel.length > 0 ? Math.max(...funnel.map(f => f.count)) : 100;

  return (
    <div className="card">
      <h3 className="table-title">转化漏斗分析</h3>
      
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
          {steps.map((step, index) => (
            <div key={index} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                type="text"
                className="form-input"
                placeholder="步骤名称"
                value={step.name}
                onChange={(e) => handleStepChange(index, 'name', e.target.value)}
                style={{ flex: 1 }}
              />
              <select
                className="form-input"
                value={step.type}
                onChange={(e) => handleStepChange(index, 'type', e.target.value)}
                style={{ width: '120px' }}
              >
                <option value="pageview">页面访问</option>
                <option value="click">点击事件</option>
              </select>
              {step.type === 'pageview' && (
                <input
                  type="text"
                  className="form-input"
                  placeholder="URL包含"
                  value={step.url}
                  onChange={(e) => handleStepChange(index, 'url', e.target.value)}
                  style={{ flex: 1 }}
                />
              )}
              {steps.length > 2 && (
                <button
                  className="btn"
                  onClick={() => handleRemoveStep(index)}
                  style={{ padding: '0.5rem' }}
                >
                  删除
                </button>
              )}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary" onClick={handleAddStep}>
            添加步骤
          </button>
          <button className="btn btn-primary" onClick={loadFunnel} disabled={loading}>
            {loading ? '分析中...' : '分析转化漏斗'}
          </button>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      {funnel.length > 0 && (
        <div className="funnel-container">
          {funnel.map((step, index) => {
            const width = (step.count / maxCount) * 100;
            return (
              <div key={index} className="funnel-step">
                <div className="funnel-step-header">
                  <span className="funnel-step-name">{step.step}</span>
                  <span className="funnel-step-stats">
                    {step.count} ({step.conversionRate}%)
                  </span>
                </div>
                <div className="funnel-bar-container">
                  <div 
                    className="funnel-bar" 
                    style={{ width: `${width}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ConversionFunnel;

