const fs = require('fs');
const path = require('path');
const { escapeCSV, parseCSVLine } = require('../utils/csvParser');
const { createLogger } = require('../utils/logger');

const logger = createLogger('UserRepository');

const DATA_DIR = path.join(__dirname, '../../data');
const USERS_FILE = path.join(DATA_DIR, 'users.csv');

function readUsers() {
  try {
    if (!fs.existsSync(USERS_FILE)) {
      return [];
    }

    const content = fs.readFileSync(USERS_FILE, 'utf8');
    if (!content || content.trim().length === 0) {
      return [];
    }

    const lines = content.trim().split('\n');
    if (lines.length <= 1) {
      return [];
    }

    const users = [];
    for (let i = 1; i < lines.length; i++) {
      try {
        if (!lines[i] || lines[i].trim().length === 0) {
          continue;
        }
        const values = parseCSVLine(lines[i]);
        if (values.length >= 6) {
          users.push({
            id: parseInt(values[0]) || 0,
            username: values[1] || '',
            password_hash: values[2] || '',
            email: values[3] || '',
            created_at: values[4] || new Date().toISOString(),
            updated_at: values[5] || new Date().toISOString(),
          });
        }
      } catch (lineError) {
        logger.warn(`解析用户数据第 ${i + 1} 行失败`, { error: lineError.message });
        continue;
      }
    }

    return users;
  } catch (error) {
    logger.error('读取用户数据失败', error);
    throw new Error('读取用户数据失败: ' + error.message);
  }
}

function writeUsers(users) {
  try {
    if (!Array.isArray(users)) {
      throw new Error('用户数据必须是数组');
    }

    const DATA_DIR = path.dirname(USERS_FILE);
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    const header = 'id,username,password_hash,email,created_at,updated_at\n';
    const lines = [header];

    users.forEach((user, index) => {
      try {
        if (!user || typeof user !== 'object') {
          console.warn(`用户数据第 ${index + 1} 项无效，已跳过`);
          return;
        }

        const line = [
          user.id || 0,
          escapeCSV(user.username || ''),
          escapeCSV(user.password_hash || ''),
          escapeCSV(user.email || ''),
          escapeCSV(user.created_at || new Date().toISOString()),
          escapeCSV(user.updated_at || new Date().toISOString()),
        ].join(',');
        lines.push(line);
      } catch (lineError) {
        logger.warn(`写入用户数据第 ${index + 1} 项失败`, { error: lineError.message });
      }
    });

    const tempFile = USERS_FILE + '.tmp';
    fs.writeFileSync(tempFile, lines.join('\n'), 'utf8');
    fs.renameSync(tempFile, USERS_FILE);
  } catch (error) {
    logger.error('写入用户数据失败', error);
    throw new Error('写入用户数据失败: ' + error.message);
  }
}

module.exports = { readUsers, writeUsers };

