import { Router } from 'express';
import {
  getSettings,
  updateSettings,
  getEmailSettings,
  updateEmailSettings,
  sendTestEmail,
} from '../controllers/settingsController.js';
import { authenticateJwt, requireAdmin } from '../middlewares/auth.js';

const router = Router();

router.use(authenticateJwt);
router.use(requireAdmin);

router.get('/', getSettings);
router.put('/', updateSettings);
router.get('/email', getEmailSettings);
router.put('/email', updateEmailSettings);
router.post('/test-email', sendTestEmail);

export default router;
