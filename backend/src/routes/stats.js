const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { getProjectStats } = require('../services/eventService');
const { verifyProjectOwnership } = require('../services/projectService');

const router = express.Router();

router.use(authenticateToken);

/**
 * 获取项目统计
 */
router.get('/:projectKey', asyncHandler(async (req, res) => {
  const { projectKey } = req.params;
  const { startTime, endTime } = req.query;

  const hasAccess = await verifyProjectOwnership(req.userId, projectKey);
  if (!hasAccess) {
    return res.status(403).json({ error: '无权访问此项目' });
  }

  const stats = await getProjectStats(projectKey, startTime, endTime);
  res.json(stats);
}));

module.exports = router;

