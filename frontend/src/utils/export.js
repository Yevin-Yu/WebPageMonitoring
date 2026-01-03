/**
 * 导出数据为CSV格式
 */
export function exportToCSV(data, filename = 'export.csv') {
  if (!data || !Array.isArray(data) || data.length === 0) {
    alert('没有数据可导出');
    return;
  }

  // 获取表头
  const headers = Object.keys(data[0]);
  
  // 构建CSV内容
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // 处理包含逗号、引号或换行的值
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',')
    )
  ].join('\n');

  // 添加BOM以支持中文
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // 创建下载链接
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 导出事件数据
 */
export function exportEvents(events, filename = 'events.csv') {
  const exportData = events.map(event => ({
    '访问时间': new Date(event.timestamp).toLocaleString('zh-CN'),
    '地域': event.region || '-',
    '来源': event.source || '-',
    '入口页面': event.entry_page || '-',
    '搜索词': event.search_keyword || '-',
    '访问IP': event.user_ip || '-',
    '访客标识码': event.visitor_id || '-',
    '访问时长(秒)': event.visit_duration || 0,
    '访问页数': event.page_count || 0,
    '类型': event.type || '-',
    '当前页面': event.page_url || '-',
    '页面标题': event.page_title || '-',
    'User Agent': event.user_agent || '-',
  }));

  exportToCSV(exportData, filename);
}

