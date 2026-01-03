const fs = require('fs');
const path = require('path');
const { escapeCSV, parseCSVLine } = require('../utils/csvParser');
const { createLogger } = require('../utils/logger');

const logger = createLogger('EventRepository');
const DATA_DIR = path.join(__dirname, '../../data');
const EVENTS_FILE = path.join(DATA_DIR, 'events.csv');

function readEvents() {
  try {
    if (!fs.existsSync(EVENTS_FILE)) {
      return [];
    }

    const content = fs.readFileSync(EVENTS_FILE, 'utf8');
    if (!content || content.trim().length === 0) {
      return [];
    }

    const lines = content.trim().split('\n');
    if (lines.length <= 1) {
      return [];
    }

    const events = [];
    for (let i = 1; i < lines.length; i++) {
      try {
        if (!lines[i] || lines[i].trim().length === 0) {
          continue;
        }
        const values = parseCSVLine(lines[i]);
        if (values.length >= 19) {
          events.push({
            id: parseInt(values[0]) || 0,
            project_key: values[1] || '',
            type: values[2] || 'unknown',
            timestamp: values[3] || new Date().toISOString(),
            page_url: values[4] || '',
            page_path: values[5] || '',
            page_title: values[6] || '',
            page_host: values[7] || '',
            user_ip: values[8] || '',
            user_agent: values[9] || '',
            user_language: values[10] || '',
            user_platform: values[11] || '',
            screen_width: parseInt(values[12]) || 0,
            screen_height: parseInt(values[13]) || 0,
            viewport_width: parseInt(values[14]) || 0,
            viewport_height: parseInt(values[15]) || 0,
            referrer: values[16] || '',
            event_data: values[17] || '{}',
            created_at: values[18] || new Date().toISOString(),
            // 新增字段
            visitor_id: values[19] || '',
            session_id: values[20] || '',
            entry_page: values[21] || '',
            source: values[22] || '',
            search_keyword: values[23] || '',
            visit_duration: parseInt(values[24]) || 0,
            page_count: parseInt(values[25]) || 0,
            region: values[26] || '',
          });
        }
      } catch (lineError) {
        logger.warn(`解析事件数据第 ${i + 1} 行失败`, { error: lineError.message });
        continue;
      }
    }

    return events;
  } catch (error) {
    logger.error('读取事件数据失败', error);
    throw new Error('读取事件数据失败: ' + error.message);
  }
}

function appendEvent(event) {
  try {
    if (!event || typeof event !== 'object') {
      throw new Error('事件数据无效');
    }

    const DATA_DIR = path.dirname(EVENTS_FILE);
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    // 如果文件不存在，先写入表头
    if (!fs.existsSync(EVENTS_FILE)) {
      const header = 'id,project_key,type,timestamp,page_url,page_path,page_title,page_host,user_ip,user_agent,user_language,user_platform,screen_width,screen_height,viewport_width,viewport_height,referrer,event_data,created_at,visitor_id,session_id,entry_page,source,search_keyword,visit_duration,page_count,region\n';
      fs.writeFileSync(EVENTS_FILE, header, 'utf8');
    }

    const line = [
      event.id || 0,
      escapeCSV(event.project_key || ''),
      escapeCSV(event.type || 'unknown'),
      escapeCSV(event.timestamp || new Date().toISOString()),
      escapeCSV(event.page_url || ''),
      escapeCSV(event.page_path || ''),
      escapeCSV(event.page_title || ''),
      escapeCSV(event.page_host || ''),
      escapeCSV(event.user_ip || ''),
      escapeCSV(event.user_agent || ''),
      escapeCSV(event.user_language || ''),
      escapeCSV(event.user_platform || ''),
      event.screen_width || 0,
      event.screen_height || 0,
      event.viewport_width || 0,
      event.viewport_height || 0,
      escapeCSV(event.referrer || ''),
      escapeCSV(event.event_data || '{}'),
      escapeCSV(event.created_at || new Date().toISOString()),
      // 新增字段
      escapeCSV(event.visitor_id || ''),
      escapeCSV(event.session_id || ''),
      escapeCSV(event.entry_page || ''),
      escapeCSV(event.source || ''),
      escapeCSV(event.search_keyword || ''),
      event.visit_duration || 0,
      event.page_count || 0,
      escapeCSV(event.region || ''),
    ].join(',') + '\n';

    fs.appendFileSync(EVENTS_FILE, line, 'utf8');
  } catch (error) {
    logger.error('追加事件数据失败', error);
    throw new Error('追加事件数据失败: ' + error.message);
  }
}

module.exports = { readEvents, appendEvent };

