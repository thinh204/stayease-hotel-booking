import { Router } from 'express';
import {
  getDashboardStats,
  getRevenueAnalytics,
  getUserAnalytics,
  getOccupancyAnalytics,
  exportReports,
} from '../controllers/analyticsController.js';
import { authenticateJwt, requireManagerOrAdmin } from '../middlewares/auth.js';

const router = Router();

router.use(authenticateJwt);

router.get('/dashboard', getDashboardStats);
router.get('/revenue', getRevenueAnalytics);
router.get('/users', getUserAnalytics);
router.get('/occupancy', getOccupancyAnalytics);
router.get('/export', requireManagerOrAdmin, exportReports);

export default router;
