const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { getRealtimeStats } = require('../services/analyticsService');
const { verifyProjectOwnership } = require('../services/projectService');

const router = express.Router();

router.use(authenticateToken);

/**
 * 获取实时统计数据
 * GET /api/analytics/realtime/:projectKey?minutes=5
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

module.exports = router;

