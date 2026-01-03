const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { getUserPaths, getConversionFunnel, getRealtimeStats, getRegionStats } = require('../services/analyticsService');
const { verifyProjectOwnership } = require('../services/projectService');

const router = express.Router();

router.use(authenticateToken);

/**
 * 获取用户路径分析
 */
router.get('/paths/:projectKey', asyncHandler(async (req, res) => {
  const { projectKey } = req.params;
  const { startTime, endTime } = req.query;

  const hasAccess = await verifyProjectOwnership(req.userId, projectKey);
  if (!hasAccess) {
    return res.status(403).json({ error: '无权访问此项目' });
  }

  const paths = await getUserPaths(projectKey, startTime, endTime);
  res.json({ data: paths });
}));

/**
 * 获取转化漏斗
 */
router.post('/funnel/:projectKey', asyncHandler(async (req, res) => {
  const { projectKey } = req.params;
  const { steps, startTime, endTime } = req.body;

  const hasAccess = await verifyProjectOwnership(req.userId, projectKey);
  if (!hasAccess) {
    return res.status(403).json({ error: '无权访问此项目' });
  }

  if (!steps || !Array.isArray(steps) || steps.length === 0) {
    return res.status(400).json({ error: '请提供有效的转化步骤' });
  }

  const funnel = await getConversionFunnel(projectKey, steps, startTime, endTime);
  res.json({ data: funnel });
}));

/**
 * 获取实时统计
 */
router.get('/realtime/:projectKey', asyncHandler(async (req, res) => {
  const { projectKey } = req.params;
  const { minutes = 5 } = req.query;

  const hasAccess = await verifyProjectOwnership(req.userId, projectKey);
  if (!hasAccess) {
    return res.status(403).json({ error: '无权访问此项目' });
  }

  const stats = await getRealtimeStats(projectKey, parseInt(minutes));
  res.json(stats);
}));

/**
 * 获取地域统计
 */
router.get('/regions/:projectKey', asyncHandler(async (req, res) => {
  const { projectKey } = req.params;
  const { startTime, endTime } = req.query;

  const hasAccess = await verifyProjectOwnership(req.userId, projectKey);
  if (!hasAccess) {
    return res.status(403).json({ error: '无权访问此项目' });
  }

  const regions = await getRegionStats(projectKey, startTime, endTime);
  res.json({ data: regions });
}));

module.exports = router;

