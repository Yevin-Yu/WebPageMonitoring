import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, getCurrentUser, updateProfile, changePassword } from '../controllers';
import { authMiddleware, validate } from '../middlewares';

const router = Router();

// Public routes
router.post(
  '/register',
  validate([
    body('username').isLength({ min: 3, max: 50 }).trim(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
  ]),
  register
);

router.post(
  '/login',
  validate([
    body('username').notEmpty(),
    body('password').notEmpty(),
  ]),
  login
);

// Protected routes
router.get('/me', authMiddleware, getCurrentUser);
router.put(
  '/profile',
  authMiddleware,
  validate([
    body('username').optional().isLength({ min: 3, max: 50 }).trim(),
    body('email').optional().isEmail().normalizeEmail(),
  ]),
  updateProfile
);
router.put(
  '/password',
  authMiddleware,
  validate([
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 6 }),
  ]),
  changePassword
);

export default router;
