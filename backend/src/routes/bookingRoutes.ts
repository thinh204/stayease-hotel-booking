import { Router } from 'express';
import {
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  refundBooking,
  notifyGuest,
  getBookingReports,
} from '../controllers/bookingController.js';
import { authenticateJwt, requireManagerOrAdmin } from '../middlewares/auth.js';

const router = Router();

router.use(authenticateJwt);

router.get('/', getAllBookings);
router.get('/reports', getBookingReports);
router.get('/:id', getBookingById);
router.put('/:id/status', requireManagerOrAdmin, updateBookingStatus);
router.post('/:id/refund', requireManagerOrAdmin, refundBooking);
router.post('/:id/notify', requireManagerOrAdmin, notifyGuest);

export default router;
