const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');
const USERS_FILE = path.join(DATA_DIR, 'users.csv');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.csv');
const EVENTS_FILE = path.join(DATA_DIR, 'events.csv');

/**
 * 初始化数据文件
 */
function initDatabase() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(USERS_FILE)) {
    const header = 'id,username,password_hash,email,created_at,updated_at\n';
    fs.writeFileSync(USERS_FILE, header, 'utf8');
    console.log('用户 CSV 文件已创建');
  }

  if (!fs.existsSync(PROJECTS_FILE)) {
    const header = 'id,key,name,description,user_id,created_at,updated_at\n';
    fs.writeFileSync(PROJECTS_FILE, header, 'utf8');
    console.log('项目 CSV 文件已创建');
  } else {
    const content = fs.readFileSync(PROJECTS_FILE, 'utf8');
    const lines = content.trim().split('\n');
    if (lines.length > 0 && !lines[0].includes('user_id')) {
      const newLines = [lines[0] + ',user_id'];
      for (let i = 1; i < lines.length; i++) {
        newLines.push(lines[i] + ',');
      }
      fs.writeFileSync(PROJECTS_FILE, newLines.join('\n'), 'utf8');
      console.log('项目 CSV 文件已迁移（添加 user_id 字段）');
    }
  }

  if (!fs.existsSync(EVENTS_FILE)) {
    const header = 'id,project_key,type,timestamp,page_url,page_path,page_title,page_host,user_ip,user_agent,user_language,user_platform,screen_width,screen_height,viewport_width,viewport_height,referrer,event_data,created_at\n';
    fs.writeFileSync(EVENTS_FILE, header, 'utf8');
    console.log('事件 CSV 文件已创建');
  }

  console.log('CSV 数据文件初始化完成');
}

module.exports = { initDatabase };


