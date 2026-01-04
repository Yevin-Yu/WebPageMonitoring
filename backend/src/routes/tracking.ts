import { Router } from 'express';
import { trackPageView, trackPerformance } from '../controllers';

const router = Router();

// Public routes (no auth required, uses project key)
router.post('/pageview', trackPageView);
router.post('/performance', trackPerformance);

export default router;
