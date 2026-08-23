import { Router } from 'express';
import {
  loginAdmin,
  getProfile,
  updateProfile,
  changePassword,
  logoutAdmin,
} from '../controllers/authController.js';
import { authenticateJwt } from '../middlewares/auth.js';

const router = Router();

router.post('/login', loginAdmin);
router.get('/profile', authenticateJwt, getProfile);
router.put('/profile', authenticateJwt, updateProfile);
router.post('/change-password', authenticateJwt, changePassword);
router.post('/logout', authenticateJwt, logoutAdmin);

export default router;
