import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  changeUserRole,
  lockUnlockUser,
  resetUserPassword,
  getUserActivity,
} from '../controllers/userController.js';
import { authenticateJwt, requireAdmin } from '../middlewares/auth.js';

const router = Router();

router.use(authenticateJwt);

router.get('/', getAllUsers);
router.post('/', requireAdmin, createUser);
router.get('/:id', getUserById);
router.put('/:id', requireAdmin, updateUser);
router.delete('/:id', requireAdmin, deleteUser);
router.put('/:id/role', requireAdmin, changeUserRole);
router.put('/:id/lock', requireAdmin, lockUnlockUser);
router.post('/:id/reset-password', requireAdmin, resetUserPassword);
router.get('/:id/activity', getUserActivity);

export default router;
