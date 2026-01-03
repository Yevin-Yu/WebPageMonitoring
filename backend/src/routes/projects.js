const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const {
  createProject,
  getProjectsByUserId,
  verifyProjectOwnership,
} = require('../services/projectService');
const { validateProjectName, validateProjectDescription, sanitizeInput } = require('../utils/validator');

const router = express.Router();

router.use(authenticateToken);

/**
 * 创建项目
 */
router.post('/', asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  // 验证项目名称
  const nameValidation = validateProjectName(name);
  if (!nameValidation.valid) {
    return res.status(400).json({ 
      error: nameValidation.error,
      code: 'VALIDATION_ERROR'
    });
  }

  // 验证项目描述
  const descValidation = validateProjectDescription(description);
  if (!descValidation.valid) {
    return res.status(400).json({ 
      error: descValidation.error,
      code: 'VALIDATION_ERROR'
    });
  }

  // 清理输入
  const sanitizedName = sanitizeInput(name);
  const sanitizedDescription = sanitizeInput(description || '');

  const project = await createProject(sanitizedName, sanitizedDescription, req.userId);
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


