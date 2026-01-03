const { readProjects, writeProjects } = require('../repositories/projectRepository');
const { validateProjectName } = require('../utils/validator');
const { ValidationError } = require('../utils/errors');
const { createLogger } = require('../utils/logger');
const crypto = require('crypto');

const logger = createLogger('ProjectService');

async function createProject(name, description = '', userId = null) {
  try {
    // 验证输入
    const nameResult = validateProjectName(name);
    if (!nameResult.valid) {
      throw new ValidationError(nameResult.error);
    }
    const validatedName = name.trim();
    const validatedDescription = (description || '').trim().substring(0, 500);

    // 验证用户ID
    if (userId && (isNaN(userId) || userId <= 0)) {
      throw new ValidationError('用户ID无效');
    }

    const projects = readProjects();
    const projectKey = crypto.randomBytes(16).toString('hex');
    const now = new Date().toISOString();

    // 生成唯一 ID
    const existingIds = projects.map(p => (p.id || 0)).filter(id => id > 0);
    const newId = existingIds.length > 0
      ? Math.max(...existingIds) + 1
      : 1;

    // 检查 ID 是否重复（理论上不应该发生）
    if (projects.some(p => p.id === newId)) {
      throw new Error('项目 ID 冲突，请重试');
    }

    const project = {
      id: newId,
      key: projectKey,
      name: validatedName,
      description: validatedDescription,
      user_id: userId ? String(userId) : null,
      created_at: now,
      updated_at: now,
    };

    projects.push(project);
    writeProjects(projects);

    return project;
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new Error('创建项目失败: ' + error.message);
  }
}

async function getProjectsByUserId(userId) {
  try {
    if (!userId || isNaN(userId) || userId <= 0) {
      throw new ValidationError('用户ID无效');
    }

    const projects = readProjects();
    const userProjects = projects.filter(p => p.user_id === String(userId));

    userProjects.sort((a, b) => {
      try {
        const timeA = new Date(a.created_at || 0).getTime();
        const timeB = new Date(b.created_at || 0).getTime();
        return timeB - timeA;
      } catch {
        return 0;
      }
    });

    return userProjects;
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new Error('获取项目列表失败: ' + error.message);
  }
}

/**
 * 验证项目所有权
 */
async function verifyProjectOwnership(userId, projectKey) {
  try {
    if (!userId || !projectKey) {
      return false;
    }

    const projects = await getProjectsByUserId(userId);
    return projects.some(p => p.key === projectKey);
  } catch (error) {
    logger.error('验证项目所有权失败', error);
    return false;
  }
}

module.exports = {
  createProject,
  getProjectsByUserId,
  verifyProjectOwnership,
};


