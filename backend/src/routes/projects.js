const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const {
  createProject,
  getProjectsByUserId,
  verifyProjectOwnership,
} = require('../services/projectService');

const router = express.Router();

router.use(authenticateToken);

/**
 * 创建项目
 */
router.post('/', asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ 
      error: '项目名称不能为空',
      code: 'VALIDATION_ERROR'
    });
  }

  const project = await createProject(name, description || '', req.userId);
  res.json(project);
}));

/**
 * 获取项目列表
 */
router.get('/', asyncHandler(async (req, res) => {
  const projects = await getProjectsByUserId(req.userId);
  res.json(projects);
}));

/**
 * 验证项目所有权中间件
 */
async function verifyOwnership(req, res, next) {
  const { projectKey } = req.params;
  const hasAccess = await verifyProjectOwnership(req.userId, projectKey);

  if (!hasAccess) {
    return res.status(403).json({ error: '无权访问此项目' });
  }

  next();
}

module.exports = router;
module.exports.verifyOwnership = verifyOwnership;


