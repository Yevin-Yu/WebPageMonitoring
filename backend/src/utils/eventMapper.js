/**
 * 事件数据映射工具
 * 负责将原始事件数据转换为存储格式
 */

const MAX_LENGTHS = {
  PROJECT_KEY: 100,
  TYPE: 50,
  URL: 500,
  PATH: 500,
  TITLE: 200,
  HOST: 200,
  IP: 50,
  USER_AGENT: 500,
  LANGUAGE: 50,
  PLATFORM: 50,
  REFERRER: 500,
  EVENT_DATA: 5000,
  VISITOR_ID: 100,
  SESSION_ID: 100,
  ENTRY_PAGE: 500,
  SOURCE: 200,
  SEARCH_KEYWORD: 200,
  REGION: 100,
};

const MAX_VALUES = {
  SCREEN_SIZE: 99999,
  DURATION: Number.MAX_SAFE_INTEGER,
  PAGE_COUNT: Number.MAX_SAFE_INTEGER,
};

function truncate(str, maxLength) {
  if (!str || typeof str !== 'string') return '';
  return str.substring(0, maxLength);
}

function clampNumber(value, min, max) {
  const num = parseInt(value, 10) || 0;
  return Math.max(min, Math.min(max, num));
}

function mapEventToRecord(event, projectKey, newId) {
  const page = event.page || {};
  const user = event.user || {};
  const data = event.data || {};
  const now = new Date().toISOString();

  return {
    id: newId,
    project_key: truncate(projectKey, MAX_LENGTHS.PROJECT_KEY),
    type: truncate(event.type || 'unknown', MAX_LENGTHS.TYPE),
    timestamp: event.timestamp || now,
    page_url: truncate(page.url || '', MAX_LENGTHS.URL),
    page_path: truncate(page.path || '', MAX_LENGTHS.PATH),
    page_title: truncate(page.title || '', MAX_LENGTHS.TITLE),
    page_host: truncate(page.host || '', MAX_LENGTHS.HOST),
    user_ip: truncate(user.ip || '', MAX_LENGTHS.IP),
    user_agent: truncate(user.userAgent || '', MAX_LENGTHS.USER_AGENT),
    user_language: truncate(user.language || '', MAX_LENGTHS.LANGUAGE),
    user_platform: truncate(user.platform || '', MAX_LENGTHS.PLATFORM),
    screen_width: clampNumber(user.screenWidth, 0, MAX_VALUES.SCREEN_SIZE),
    screen_height: clampNumber(user.screenHeight, 0, MAX_VALUES.SCREEN_SIZE),
    viewport_width: clampNumber(user.viewportWidth, 0, MAX_VALUES.SCREEN_SIZE),
    viewport_height: clampNumber(user.viewportHeight, 0, MAX_VALUES.SCREEN_SIZE),
    referrer: truncate(user.referrer || '', MAX_LENGTHS.REFERRER),
    event_data: truncate(JSON.stringify(data), MAX_LENGTHS.EVENT_DATA),
    created_at: now,
    visitor_id: truncate(event.visitorId || '', MAX_LENGTHS.VISITOR_ID),
    session_id: truncate(event.sessionId || '', MAX_LENGTHS.SESSION_ID),
    entry_page: truncate(event.entryPage || '', MAX_LENGTHS.ENTRY_PAGE),
    source: truncate(event.source || '', MAX_LENGTHS.SOURCE),
    search_keyword: truncate(event.searchKeyword || '', MAX_LENGTHS.SEARCH_KEYWORD),
    visit_duration: clampNumber(event.visitDuration, 0, MAX_VALUES.DURATION),
    page_count: clampNumber(event.pageCount, 0, MAX_VALUES.PAGE_COUNT),
    region: truncate('', MAX_LENGTHS.REGION),
  };
}

module.exports = {
  mapEventToRecord,
  MAX_LENGTHS,
  MAX_VALUES,
};

