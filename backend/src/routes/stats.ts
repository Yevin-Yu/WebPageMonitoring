import { Router } from 'express';
import { getDashboardStats, getPageStats, getPerformanceStats, getVisitorStats } from '../controllers';
import { authMiddleware } from '../middlewares';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

router.get('/dashboard/:projectId', getDashboardStats);
router.get('/pages/:projectId', getPageStats);
router.get('/performance/:projectId', getPerformanceStats);
router.get('/visitors/:projectId', getVisitorStats);

export default router;
