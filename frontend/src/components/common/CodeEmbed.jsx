import React, { useState } from 'react';
import PropTypes from 'prop-types';

function CodeEmbed({ projectKey, projectName }) {
  const [copied, setCopied] = useState(false);

  // 获取当前环境的插件 URL
  const getPluginUrl = () => {
    const protocol = window.location.protocol;
    const host = window.location.hostname;
    const port = window.location.port;
    const baseUrl = port ? `${protocol}//${host}:${port}` : `${protocol}//${host}`;
    return `${baseUrl}/plugin/monitoring.js`;
  };

  const pluginUrl = getPluginUrl();

  const embedCode = `<!-- WebPage Monitoring - ${projectName} -->
<script src="${pluginUrl}" data-project-key="${projectKey}" async></script>
<!-- End WebPage Monitoring -->`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="code-embed">
      <div className="code-embed-header">
        <h3 className="code-embed-title">嵌入代码</h3>
        <button
          className="code-embed-copy-btn"
          onClick={handleCopy}
          type="button"
        >
          {copied ? '✓ 已复制' : '📋 复制代码'}
        </button>
      </div>
      <p className="code-embed-description">
        将以下代码复制并粘贴到您的网站 <code>&lt;head&gt;</code> 标签中，
        建议放在 <code>&lt;/head&gt;</code> 结束标签之前。
      </p>
      <div className="code-embed-code">
        <pre><code>{embedCode}</code></pre>
      </div>
      <div className="code-embed-tips">
        <h4 className="code-embed-tips-title">💡 使用提示</h4>
        <ul className="code-embed-tips-list">
          <li>代码会自动收集页面访问、性能指标和错误信息</li>
          <li>建议在所有页面都嵌入此代码以获得完整数据</li>
          <li>使用 <code>async</code> 异步加载，不会阻塞页面渲染</li>
          <li>支持单页应用（SPA）的自动追踪</li>
          <li>通过 <code>data-project-key</code> 属性标识项目</li>
        </ul>
      </div>
      <div className="code-embed-info">
        <h4 className="code-embed-info-title">📝 部署说明</h4>
        <p className="code-embed-info-text">
          当前环境：<strong>{window.location.hostname === 'localhost' ? '开发环境' : '生产环境'}</strong><br />
          插件地址：<code>{pluginUrl}</code>
        </p>
      </div>
    </div>
  );
}

CodeEmbed.propTypes = {
  projectKey: PropTypes.string.isRequired,
  projectName: PropTypes.string,
};

CodeEmbed.defaultProps = {
  projectName: '您的项目',
};

export default CodeEmbed;
