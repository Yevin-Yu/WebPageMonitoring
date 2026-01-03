const fs = require('fs');
const path = require('path');
const { escapeCSV, parseCSVLine } = require('../utils/csvParser');
const { createLogger } = require('../utils/logger');

const logger = createLogger('ProjectRepository');

const DATA_DIR = path.join(__dirname, '../../data');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.csv');

/**
 * 读取所有项目数据
 * @returns {Array} 项目数组
 */
function readProjects() {
  try {
    if (!fs.existsSync(PROJECTS_FILE)) {
      return [];
    }

    const content = fs.readFileSync(PROJECTS_FILE, 'utf8');
    if (!content || content.trim().length === 0) {
      return [];
    }

    const lines = content.trim().split('\n');
    if (lines.length <= 1) {
      return [];
    }

    const projects = [];
    for (let i = 1; i < lines.length; i++) {
      try {
        if (!lines[i] || lines[i].trim().length === 0) {
          continue;
        }
        const values = parseCSVLine(lines[i]);
        if (values.length >= 6) {
          projects.push({
            id: parseInt(values[0]) || 0,
            key: values[1] || '',
            name: values[2] || '',
            description: values[3] || '',
            user_id: values.length >= 7 ? (values[4] || null) : null,
            created_at: values.length >= 7 ? values[5] : values[4] || new Date().toISOString(),
            updated_at: values.length >= 7 ? values[6] : values[5] || new Date().toISOString(),
          });
        }
      } catch (lineError) {
        logger.warn(`解析项目数据第 ${i + 1} 行失败`, { error: lineError.message });
        continue;
      }
    }

    return projects;
  } catch (error) {
    logger.error('读取项目数据失败', error);
    throw new Error('读取项目数据失败: ' + error.message);
  }
}

/**
 * 写入项目数据到 CSV 文件
 * @param {Array} projects - 项目数组
 */
function writeProjects(projects) {
  try {
    if (!Array.isArray(projects)) {
      throw new Error('项目数据必须是数组');
    }

    // 确保数据目录存在
    const DATA_DIR = path.dirname(PROJECTS_FILE);
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    const header = 'id,key,name,description,user_id,created_at,updated_at\n';
    const lines = [header];

    projects.forEach((project, index) => {
      try {
        if (!project || typeof project !== 'object') {
          console.warn(`项目数据第 ${index + 1} 项无效，已跳过`);
          return;
        }

        const line = [
          project.id || 0,
          escapeCSV(project.key || ''),
          escapeCSV(project.name || ''),
          escapeCSV(project.description || ''),
          escapeCSV(project.user_id || ''),
          escapeCSV(project.created_at || new Date().toISOString()),
          escapeCSV(project.updated_at || new Date().toISOString()),
        ].join(',');
        lines.push(line);
      } catch (lineError) {
        logger.warn(`写入项目数据第 ${index + 1} 项失败`, { error: lineError.message });
      }
    });

    // 使用临时文件写入，然后重命名（原子操作）
    const tempFile = PROJECTS_FILE + '.tmp';
    fs.writeFileSync(tempFile, lines.join('\n'), 'utf8');
    fs.renameSync(tempFile, PROJECTS_FILE);
  } catch (error) {
    logger.error('写入项目数据失败', error);
    throw new Error('写入项目数据失败: ' + error.message);
  }
}

module.exports = { readProjects, writeProjects };

