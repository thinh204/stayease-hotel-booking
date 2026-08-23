import { Router } from 'express';
import {
  getAllHotels,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel,
  toggleHotelStatus,
  assignManager,
  getHotelBookings,
  addRoomToHotel,
} from '../controllers/hotelController.js';
import { authenticateJwt, requireManagerOrAdmin, requireAdmin } from '../middlewares/auth.js';

const router = Router();

router.use(authenticateJwt);

router.get('/', getAllHotels);
router.post('/', requireManagerOrAdmin, createHotel);
router.get('/:id', getHotelById);
router.put('/:id', requireManagerOrAdmin, updateHotel);
router.delete('/:id', requireAdmin, deleteHotel);
router.put('/:id/status', requireManagerOrAdmin, toggleHotelStatus);
router.put('/:id/assign-manager', requireAdmin, assignManager);
router.get('/:id/bookings', getHotelBookings);
router.post('/:id/rooms', requireManagerOrAdmin, addRoomToHotel);

export default router;
