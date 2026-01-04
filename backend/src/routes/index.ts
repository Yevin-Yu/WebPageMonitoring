import { Router } from 'express';
import authRoutes from './auth';
import projectRoutes from './projects';
import trackingRoutes from './tracking';
import statsRoutes from './stats';

const router = Router();

router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/track', trackingRoutes);
router.use('/stats', statsRoutes);

export default router;
