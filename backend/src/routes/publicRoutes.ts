import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prisma.js';
import { createAuditLog } from '../middlewares/audit.js';
import crypto from 'crypto';

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

const getGoogleConfig = () => ({
  clientId: process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  callbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/public/auth/google/callback',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
});

router.get('/auth/google', (req: Request, res: Response): void => {
  const config = getGoogleConfig();
  if (!config.clientId || !config.clientSecret) {
    res.status(503).json({ success: false, message: 'Google sign-in is not configured.' });
    return;
  }

  const locale = ['vi', 'en', 'ko'].includes(String(req.query.locale)) ? String(req.query.locale) : 'vi';
  const secret = process.env.JWT_SECRET || 'stayease_default_secret';
  const state = jwt.sign({ purpose: 'google-oauth', locale }, secret, { expiresIn: '10m' });
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.callbackUrl,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    prompt: 'select_account',
  });

  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
});

router.get('/auth/google/callback', async (req: Request, res: Response): Promise<void> => {
  const config = getGoogleConfig();
  let locale = 'vi';
  try {
    if (!req.query.code || !req.query.state) throw new Error('Missing Google authorization response.');
    const secret = process.env.JWT_SECRET || 'stayease_default_secret';
    const decoded = jwt.verify(String(req.query.state), secret) as { purpose?: string; locale?: string };
    if (decoded.purpose !== 'google-oauth') throw new Error('Invalid OAuth state.');
    if (decoded.locale && ['vi', 'en', 'ko'].includes(decoded.locale)) locale = decoded.locale;

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: String(req.query.code),
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: config.callbackUrl,
        grant_type: 'authorization_code',
      }),
    });
    if (!tokenResponse.ok) throw new Error('Google token exchange failed.');
    const googleTokens = await tokenResponse.json() as { access_token?: string };
    if (!googleTokens.access_token) throw new Error('Google did not return an access token.');

    const profileResponse = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: { Authorization: `Bearer ${googleTokens.access_token}` },
    });
    if (!profileResponse.ok) throw new Error('Unable to read Google profile.');
    const profile = await profileResponse.json() as { email?: string; email_verified?: boolean; name?: string; picture?: string };
    if (!profile.email || !profile.email_verified) throw new Error('A verified Google email is required.');

    const email = profile.email.toLowerCase().trim();
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          fullName: profile.name || email.split('@')[0],
          password: await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10),
          avatar: profile.picture || null,
          role: 'USER',
          lastLogin: new Date(),
        },
      });
    } else {
      if (user.isLocked || !user.isActive) throw new Error('This StayEase account is unavailable.');
      user = await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date(), loginAttempts: 0, avatar: user.avatar || profile.picture || null },
      });
    }

    const stayEaseToken = jwt.sign({ id: user.id, email: user.email, role: user.role }, secret, { expiresIn: '7d' });
    const safeUser = { id: user.id, fullName: user.fullName, email: user.email, phone: user.phone, avatar: user.avatar, bio: user.bio, role: user.role };
    const encodedUser = Buffer.from(JSON.stringify(safeUser)).toString('base64url');
    res.redirect(`${config.frontendUrl}/${locale}/auth/google/callback#token=${encodeURIComponent(stayEaseToken)}&user=${encodedUser}`);
  } catch (error) {
    console.error('Google OAuth error:', error);
    res.redirect(`${config.frontendUrl}/${locale}/sign-up?error=google_oauth_failed`);
  }
});

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

// Create or update a verified guest review
router.post('/hotels/:hotelId/reviews', customerAuth, async (req: any, res: Response): Promise<void> => {
  const hotelId = String(req.params.hotelId);
  const rating = Number(req.body.rating);
  const comment = String(req.body.comment || '').trim();

  if (!Number.isInteger(rating) || rating < 1 || rating > 5 || comment.length < 10 || comment.length > 1000) {
    res.status(400).json({ success: false, message: 'Rating must be 1–5 and comment must contain 10–1000 characters.' });
    return;
  }

  try {
    const eligibleBooking = await prisma.booking.findFirst({
      where: { userId: req.user.id, hotelId, status: { in: ['confirmed', 'completed'] } },
    });
    if (!eligibleBooking) {
      res.status(403).json({ success: false, message: 'Only guests with a confirmed or completed stay can review this hotel.' });
      return;
    }

    const existing = await prisma.review.findFirst({ where: { userId: req.user.id, hotelId } });
    const review = existing
      ? await prisma.review.update({ where: { id: existing.id }, data: { rating, comment } })
      : await prisma.review.create({ data: { userId: req.user.id, hotelId, rating, comment } });

    const aggregate = await prisma.review.aggregate({ where: { hotelId }, _avg: { rating: true } });
    await prisma.hotel.update({ where: { id: hotelId }, data: { rating: aggregate._avg.rating || rating } });
    res.status(existing ? 200 : 201).json({ success: true, data: review, message: existing ? 'Review updated.' : 'Review published.' });
  } catch (error) {
    console.error('Review submission error:', error);
    res.status(500).json({ success: false, message: 'Unable to publish review.' });
  }
});

// ==========================================
// 3. CUSTOMER BOOKINGS API
// ==========================================

// Create new customer booking
router.post('/bookings', customerAuth, async (req: any, res: Response): Promise<void> => {
  const { hotelId, roomId, checkIn, checkOut, guests, specialRequests, paymentMethod, paymentReference } = req.body;
  const allowedPaymentMethods = ['visa', 'mastercard', 'bank', 'momo', 'zalopay', 'vnpay'];

  if (!hotelId || !checkIn || !checkOut) {
    res.status(400).json({ success: false, message: 'Hotel ID and stay dates are required.' });
    return;
  }
  if (!allowedPaymentMethods.includes(paymentMethod)) {
    res.status(400).json({ success: false, message: 'Please select a supported payment method.' });
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
        status: 'pending',
        paymentStatus: 'pending',
        specialRequests: [`[Payment: ${paymentMethod.toUpperCase()} · ${paymentReference || 'SANDBOX'}]`, specialRequests].filter(Boolean).join(' '),
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
      newValues: { reference: refCode, totalPrice, nights, paymentMethod, paymentReference },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(201).json({
      success: true,
      message: 'Reservation created. Complete payment to confirm your stay.',
      data: booking,
    });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ success: false, message: 'Failed to process reservation.' });
  }
});

// Sandbox payment callback. Production gateways must verify their signed server-to-server callback here.
router.post('/bookings/:id/payments/confirm', customerAuth, async (req: any, res: Response): Promise<void> => {
  const paymentReference = String(req.body.paymentReference || '').trim();
  const paymentMethod = String(req.body.paymentMethod || '').trim();
  if (!paymentReference || !['visa', 'mastercard', 'bank', 'momo', 'zalopay', 'vnpay'].includes(paymentMethod)) {
    res.status(400).json({ success: false, message: 'Invalid payment confirmation.' });
    return;
  }
  try {
    const booking = await prisma.booking.findFirst({ where: { id: String(req.params.id), userId: req.user.id } });
    if (!booking) {
      res.status(404).json({ success: false, message: 'Reservation not found.' });
      return;
    }
    if (booking.paymentStatus === 'completed') {
      res.json({ success: true, data: booking, message: 'Payment was already confirmed.' });
      return;
    }
    const confirmed = await prisma.booking.update({
      where: { id: booking.id },
      data: { status: 'confirmed', paymentStatus: 'completed' },
      include: { hotel: true, room: true },
    });
    await createAuditLog({
      userId: req.user.id,
      action: 'PAYMENT_CONFIRMED',
      entity: 'Booking',
      entityId: booking.id,
      description: `Sandbox payment ${paymentReference} confirmed via ${paymentMethod}`,
      newValues: { paymentReference, paymentMethod, paymentStatus: 'completed' },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    res.json({ success: true, data: confirmed, message: 'Payment confirmed. Your reservation is now secured.' });
  } catch (error) {
    console.error('Payment confirmation error:', error);
    res.status(500).json({ success: false, message: 'Unable to confirm payment.' });
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
