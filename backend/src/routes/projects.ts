import { Router } from 'express';
import { body } from 'express-validator';
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectStats,
} from '../controllers';
import { authMiddleware, validate } from '../middlewares';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

router.post(
  '/',
  validate([
    body('name').isLength({ min: 1, max: 100 }).trim(),
    body('description').optional().isLength({ max: 500 }),
    body('website').optional().isURL(),
  ]),
  createProject
);

router.get('/', getProjects);
router.get('/:id', getProjectById);
router.get('/:id/stats', getProjectStats);
router.put(
  '/:id',
  validate([
    body('name').optional().isLength({ min: 1, max: 100 }).trim(),
    body('description').optional().isLength({ max: 500 }),
    body('website').optional().isURL(),
    body('isActive').optional().isBoolean(),
  ]),
  updateProject
);
router.delete('/:id', deleteProject);

export default router;
