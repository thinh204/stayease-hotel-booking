import { Router } from 'express';
import {
  getAuditLogs,
  getUserAuditLogs,
  exportAuditLogs,
} from '../controllers/auditController.js';
import { authenticateJwt, requireAdmin } from '../middlewares/auth.js';

const router = Router();

router.use(authenticateJwt);
router.use(requireAdmin);

router.get('/logs', getAuditLogs);
router.get('/user-activity/:userId', getUserAuditLogs);
router.get('/export', exportAuditLogs);

export default router;
