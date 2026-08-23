import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prisma.js';
import { createAuditLog } from '../middlewares/audit.js';

const router = Router();

// ==========================================
// 1. PUBLIC HOTELS API
// ==========================================

// Get All Public Hotels with filtering
router.get('/hotels', async (req: Request, res: Response) => {
  try {
    const search = (req.query.search as string || '').trim().toLowerCase();
    const city = (req.query.city as string || '').trim();
    const minPrice = parseFloat(req.query.minPrice as string) || 0;
    const maxPrice = parseFloat(req.query.maxPrice as string) || 10000;
    const rating = parseFloat(req.query.rating as string) || 0;
    const sort = (req.query.sort as string) || 'popular';

    const where: any = {
      isActive: true,
      pricePerNight: { gte: minPrice, lte: maxPrice },
      rating: { gte: rating },
    };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { city: { contains: search } },
        { country: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (city && city !== 'ALL') {
      where.city = { contains: city };
    }

    let orderBy: any = { rating: 'desc' };
    if (sort === 'price_asc') orderBy = { pricePerNight: 'asc' };
    if (sort === 'price_desc') orderBy = { pricePerNight: 'desc' };
    if (sort === 'newest') orderBy = { createdAt: 'desc' };

    const hotels = await prisma.hotel.findMany({
      where,
      include: {
        rooms: true,
        reviews: {
          include: { user: { select: { fullName: true, avatar: true } } },
          take: 3,
        },
      },
      orderBy,
    });

    const data = hotels.map((h) => {
      let images: string[] = [];
      let amenities: string[] = [];
      try { images = JSON.parse(h.images); } catch { images = []; }
      try { amenities = JSON.parse(h.amenities); } catch { amenities = []; }

      return {
        id: h.id,
        slug: h.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || h.id,
        name: h.name,
        description: h.description,
        city: h.city,
        country: h.country,
        address: h.address,
        pricePerNight: h.pricePerNight,
        rating: h.rating,
        images,
        amenities,
        totalRooms: h.rooms.reduce((sum, r) => sum + r.totalRooms, 0) || 10,
        rooms: h.rooms.map((r) => {
          let rImages: string[] = [];
          let rAmenities: string[] = [];
          try { rImages = JSON.parse(r.images); } catch {}
          try { rAmenities = JSON.parse(r.amenities); } catch {}
          return {
            id: r.id,
            type: r.type,
            price: r.price,
            capacity: r.capacity,
            availableRooms: r.availableRooms,
            images: rImages,
            amenities: rAmenities,
          };
        }),
        reviews: h.reviews,
      };
    });

    res.json({ success: true, data });
  } catch (error) {
    console.error('Public hotels fetch error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch luxury hotels' });
  }
});

// Get Single Hotel by Slug or ID
router.get('/hotels/:slugOrId', async (req: Request, res: Response): Promise<void> => {
  const { slugOrId } = req.params;
  try {
    const hotels = await prisma.hotel.findMany({
      where: { isActive: true },
      include: {
        rooms: true,
        reviews: {
          include: { user: { select: { fullName: true, avatar: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    const hotel = hotels.find(
      (h) =>
        h.id === slugOrId ||
        h.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') === slugOrId
    );

    if (!hotel) {
      res.status(404).json({ success: false, message: 'Hotel not found' });
      return;
    }

    let images: string[] = [];
    let amenities: string[] = [];
    try { images = JSON.parse(hotel.images); } catch {}
    try { amenities = JSON.parse(hotel.amenities); } catch {}

    res.json({
      success: true,
      data: {
        id: hotel.id,
        slug: hotel.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
        name: hotel.name,
        description: hotel.description,
        city: hotel.city,
        country: hotel.country,
        address: hotel.address,
        pricePerNight: hotel.pricePerNight,
        rating: hotel.rating,
        images,
        amenities,
        rooms: hotel.rooms.map((r) => {
          let rImages: string[] = [];
          let rAmenities: string[] = [];
          try { rImages = JSON.parse(r.images); } catch {}
          try { rAmenities = JSON.parse(r.amenities); } catch {}
          return {
            id: r.id,
            type: r.type,
            price: r.price,
            capacity: r.capacity,
            availableRooms: r.availableRooms,
            images: rImages,
            amenities: rAmenities,
          };
        }),
        reviews: hotel.reviews,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch hotel details' });
  }
});

// ==========================================
// 2. CUSTOMER AUTH API
// ==========================================

// Register
router.post('/auth/register', async (req: Request, res: Response): Promise<void> => {
  const { fullName, email, password, phone } = req.body;
  if (!fullName || !email || !password) {
    res.status(400).json({ success: false, message: 'Please provide full name, email, and password.' });
    return;
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existing) {
      res.status(400).json({ success: false, message: 'Email address is already registered.' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        fullName,
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        phone: phone || null,
        role: 'USER',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fullName)}`,
      },
    });

    const secret = process.env.JWT_SECRET || 'stayease_default_secret';
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, secret, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to StayEase.',
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create user account.' });
  }
});

// Login
router.post('/auth/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ success: false, message: 'Please provide email and password.' });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    if (user.isLocked) {
      res.status(403).json({ success: false, message: 'Account is temporarily locked. Please contact concierge.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date(), loginAttempts: 0 },
    });

    const secret = process.env.JWT_SECRET || 'stayease_default_secret';
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, secret, { expiresIn: '7d' });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        bio: user.bio,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Login failed.' });
  }
});

// Profile helper middleware
const customerAuth = async (req: any, res: Response, next: any): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Please sign in to continue.' });
    return;
  }
  try {
    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'stayease_default_secret';
    const decoded: any = jwt.verify(token, secret);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user || user.isLocked) {
      res.status(401).json({ success: false, message: 'User not found or account locked.' });
      return;
    }
    req.user = user;
    next();
  } catch (e) {
    res.status(401).json({ success: false, message: 'Session expired. Please sign in again.' });
  }
};

// Customer Profile
router.get('/auth/me', customerAuth, (req: any, res: Response) => {
  const { id, fullName, email, phone, avatar, bio, role, createdAt } = req.user;
  res.json({
    success: true,
    user: { id, fullName, email, phone, avatar, bio, role, createdAt },
  });
});

// Update Profile
router.put('/auth/profile', customerAuth, async (req: any, res: Response) => {
  const { fullName, phone, bio, avatar } = req.body;
  try {
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        fullName: fullName ?? undefined,
        phone: phone ?? undefined,
        bio: bio ?? undefined,
        avatar: avatar ?? undefined,
      },
    });
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updated.id,
        fullName: updated.fullName,
        email: updated.email,
        phone: updated.phone,
        avatar: updated.avatar,
        bio: updated.bio,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
});

// ==========================================
// 3. CUSTOMER BOOKINGS API
// ==========================================

// Create new customer booking
router.post('/bookings', customerAuth, async (req: any, res: Response): Promise<void> => {
  const { hotelId, roomId, checkIn, checkOut, guests, specialRequests } = req.body;

  if (!hotelId || !checkIn || !checkOut) {
    res.status(400).json({ success: false, message: 'Hotel ID and stay dates are required.' });
    return;
  }

  try {
    const hotel = await prisma.hotel.findUnique({
      where: { id: hotelId },
      include: { rooms: true },
    });

    if (!hotel) {
      res.status(404).json({ success: false, message: 'Hotel not found.' });
      return;
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
    const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    let pricePerNight = hotel.pricePerNight;
    if (roomId) {
      const room = hotel.rooms.find((r) => r.id === roomId);
      if (room) pricePerNight = room.price;
    }

    const totalPrice = pricePerNight * nights;
    const refCode = `BK-${Math.floor(10000 + Math.random() * 90000)}`;

    const booking = await prisma.booking.create({
      data: {
        reference: refCode,
        userId: req.user.id,
        hotelId,
        roomId: roomId || null,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        nights,
        guests: parseInt(guests) || 2,
        totalPrice,
        status: 'confirmed',
        paymentStatus: 'completed',
        specialRequests: specialRequests || null,
      },
      include: {
        hotel: true,
        room: true,
      },
    });

    await createAuditLog({
      userId: req.user.id,
      action: 'CUSTOMER_CREATED_BOOKING',
      entity: 'Booking',
      entityId: booking.id,
      description: `Guest ${req.user.fullName} booked ${nights} nights at ${hotel.name} ($${totalPrice})`,
      newValues: { reference: refCode, totalPrice, nights },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(201).json({
      success: true,
      message: 'Your luxury reservation has been confirmed!',
      data: booking,
    });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ success: false, message: 'Failed to process reservation.' });
  }
});

// Get Current User's Bookings
router.get('/user/bookings', customerAuth, async (req: any, res: Response) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: req.user.id },
      include: {
        hotel: true,
        room: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch your bookings.' });
  }
});

// Cancel Customer Booking
router.post('/user/bookings/:id/cancel', customerAuth, async (req: any, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { hotel: true },
    });

    if (!booking || booking.userId !== req.user.id) {
      res.status(404).json({ success: false, message: 'Booking not found.' });
      return;
    }

    if (booking.status === 'cancelled') {
      res.status(400).json({ success: false, message: 'This booking has already been cancelled.' });
      return;
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        status: 'cancelled',
        paymentStatus: 'refunded',
        refundAmount: booking.totalPrice,
        refundReason: 'Customer requested cancellation via online account.',
      },
    });

    await createAuditLog({
      userId: req.user.id,
      action: 'CUSTOMER_CANCELLED_BOOKING',
      entity: 'Booking',
      entityId: id,
      description: `Guest ${req.user.fullName} cancelled reservation ${booking.reference} at ${booking.hotel.name}`,
      newValues: { status: 'cancelled' },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({
      success: true,
      message: 'Reservation cancelled successfully. A full refund has been initiated.',
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to cancel reservation.' });
  }
});

export default router;
