const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { saveEvent, getEvents, getProjectStats, getEventStats } = require('../services/eventService');
const { verifyProjectOwnership } = require('../services/projectService');

const router = express.Router();

/**
 * 接收监控事件（无需认证，由插件调用）
 */
router.post('/', asyncHandler(async (req, res) => {
  const { projectKey, events } = req.body;

  if (!projectKey || typeof projectKey !== 'string') {
    return res.status(400).json({ 
      error: '项目Key无效',
      code: 'VALIDATION_ERROR'
    });
  }

  if (!events || !Array.isArray(events)) {
    return res.status(400).json({ 
      error: '事件数据必须是数组',
      code: 'VALIDATION_ERROR'
    });
  }

  if (events.length === 0) {
    return res.json({
      success: true,
      saved: 0,
      message: '没有需要保存的事件',
    });
  }

  const savedCount = await saveEvent(projectKey, events);
  res.json({
    success: true,
    saved: savedCount,
    message: `成功保存 ${savedCount} 个事件`,
  });
}));

/**
 * 获取事件列表（需要认证）
 */
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
  const { projectKey, type, startTime, endTime, page = 1, pageSize = 20 } = req.query;

  if (!projectKey) {
    return res.status(400).json({ error: '缺少 projectKey 参数' });
  }

  const hasAccess = await verifyProjectOwnership(req.userId, projectKey);
  if (!hasAccess) {
    return res.status(403).json({ error: '无权访问此项目' });
  }

  const result = await getEvents({
    projectKey,
    type,
    startTime,
    endTime,
    page: parseInt(page),
    pageSize: parseInt(pageSize),
  });

  res.json(result);
}));

/**
 * 获取项目统计
 */
router.get('/stats', authenticateToken, asyncHandler(async (req, res) => {
  const { projectKey, startTime, endTime } = req.query;

  if (!projectKey) {
    return res.status(400).json({ error: '缺少 projectKey 参数' });
  }

  const hasAccess = await verifyProjectOwnership(req.userId, projectKey);
  if (!hasAccess) {
    return res.status(403).json({ error: '无权访问此项目' });
  }

  const stats = await getEventStats(projectKey, startTime, endTime);
  res.json(stats);
}));

module.exports = router;


