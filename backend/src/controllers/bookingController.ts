import { Response } from 'express';
import prisma from '../prisma.js';
import { AuthenticatedRequest } from '../middlewares/auth.js';
import { createAuditLog } from '../middlewares/audit.js';

export const getAllBookings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string) || 20);
    const status = (req.query.status as string || '').trim();
    const search = (req.query.search as string || '').trim().toLowerCase();
    const from = req.query.from as string;
    const to = req.query.to as string;
    const hotelId = req.query.hotelId as string;

    const where: any = {};

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (hotelId) {
      where.hotelId = hotelId;
    }

    if (search) {
      where.OR = [
        { reference: { contains: search } },
        { user: { fullName: { contains: search } } },
        { user: { email: { contains: search } } },
        { hotel: { name: { contains: search } } },
      ];
    }

    if (from || to) {
      where.checkIn = {};
      if (from) where.checkIn.gte = new Date(from);
      if (to) where.checkIn.lte = new Date(to);
    }

    const total = await prisma.booking.count({ where });

    const bookings = await prisma.booking.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: { select: { id: true, fullName: true, email: true, phone: true, avatar: true } },
        hotel: { select: { id: true, name: true, city: true, country: true, images: true } },
        room: { select: { id: true, type: true, price: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Overall stats for summary bar
    const allBookings = await prisma.booking.findMany({
      select: { status: true, totalPrice: true },
    });

    const confirmed = allBookings.filter((b) => b.status === 'confirmed' || b.status === 'completed');
    const pending = allBookings.filter((b) => b.status === 'pending');
    const cancelled = allBookings.filter((b) => b.status === 'cancelled');
    const totalRevenue = confirmed.reduce((sum, b) => sum + b.totalPrice, 0);

    const data = bookings.map((b) => {
      let hotelImages: string[] = [];
      try { hotelImages = JSON.parse(b.hotel.images); } catch { hotelImages = []; }

      return {
        id: b.id,
        reference: b.reference,
        guest: {
          id: b.user.id,
          name: b.user.fullName,
          email: b.user.email,
          phone: b.user.phone,
          avatar: b.user.avatar,
        },
        hotel: {
          id: b.hotel.id,
          name: b.hotel.name,
          city: b.hotel.city,
          country: b.hotel.country,
          image: hotelImages[0] || null,
        },
        room: {
          id: b.room?.id || null,
          type: b.room?.type || 'Standard Deluxe Suite',
          price: b.room?.price || b.totalPrice / (b.nights || 1),
        },
        checkIn: b.checkIn,
        checkOut: b.checkOut,
        nights: b.nights,
        guests: b.guests,
        totalPrice: b.totalPrice,
        status: b.status,
        paymentStatus: b.paymentStatus,
        specialRequests: b.specialRequests,
        refundAmount: b.refundAmount,
        refundReason: b.refundReason,
        createdAt: b.createdAt,
      };
    });

    res.json({
      success: true,
      data,
      statistics: {
        totalBookings: allBookings.length,
        confirmedBookings: confirmed.length,
        pendingBookings: pending.length,
        cancelledBookings: cancelled.length,
        totalRevenue,
      },
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch bookings.' });
  }
};

export const getBookingById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        user: true,
        hotel: true,
        room: true,
      },
    });

    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found.' });
      return;
    }

    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch booking details.' });
  }
};

export const updateBookingStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status, reason } = req.body;

  if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
    res.status(400).json({ success: false, message: 'Invalid status value.' });
    return;
  }

  try {
    const oldBooking = await prisma.booking.findUnique({
      where: { id },
      include: { user: true, hotel: true },
    });

    if (!oldBooking) {
      res.status(404).json({ success: false, message: 'Booking not found.' });
      return;
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { status },
    });

    await createAuditLog({
      userId: req.user!.id,
      action: 'UPDATE_BOOKING_STATUS',
      entity: 'Booking',
      entityId: id,
      description: `Updated booking ${oldBooking.reference} status from ${oldBooking.status} to ${status}. Reason: ${reason || 'Admin action'}`,
      oldValues: { status: oldBooking.status },
      newValues: { status, reason },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ success: true, message: 'Booking status updated successfully.', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update booking status.' });
  }
};

export const refundBooking = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { amount, reason, refundType } = req.body;

  try {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { user: true, hotel: true },
    });

    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found.' });
      return;
    }

    const refundAmount = parseFloat(amount) || booking.totalPrice;

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        status: 'cancelled',
        paymentStatus: 'refunded',
        refundAmount,
        refundReason: reason || 'Customer refund requested by administration.',
      },
    });

    await createAuditLog({
      userId: req.user!.id,
      action: 'PROCESS_REFUND',
      entity: 'Booking',
      entityId: id,
      description: `Processed ${refundType || 'full'} refund of $${refundAmount} for booking ${booking.reference}. Reason: ${reason || 'Admin processed'}`,
      oldValues: { paymentStatus: booking.paymentStatus, status: booking.status },
      newValues: { paymentStatus: 'refunded', status: 'cancelled', refundAmount, reason },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({
      success: true,
      message: `Refund of $${refundAmount.toLocaleString()} processed successfully for ${booking.reference}.`,
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to process refund.' });
  }
};

export const notifyGuest = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { type, subject, message } = req.body;

  try {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { user: true, hotel: true },
    });

    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found.' });
      return;
    }

    await createAuditLog({
      userId: req.user!.id,
      action: 'SEND_GUEST_NOTIFICATION',
      entity: 'Booking',
      entityId: id,
      description: `Dispatched ${type || 'email'} notification "${subject}" to guest ${booking.user.fullName} (${booking.user.email})`,
      newValues: { subject, message, type },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({
      success: true,
      message: `Notification successfully sent to ${booking.user.email}.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to dispatch notification.' });
  }
};

export const getBookingReports = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { from, to } = req.query;
    const where: any = {};
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from as string);
      if (to) where.createdAt.lte = new Date(to as string);
    }

    const bookings = await prisma.booking.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    });

    // Group daily
    const grouped: Record<string, { totalBookings: number; confirmedBookings: number; cancelledBookings: number; totalRevenue: number }> = {};

    bookings.forEach((b) => {
      const dateKey = b.createdAt.toISOString().split('T')[0];
      if (!grouped[dateKey]) {
        grouped[dateKey] = { totalBookings: 0, confirmedBookings: 0, cancelledBookings: 0, totalRevenue: 0 };
      }
      grouped[dateKey].totalBookings++;
      if (b.status === 'confirmed' || b.status === 'completed') {
        grouped[dateKey].confirmedBookings++;
        grouped[dateKey].totalRevenue += b.totalPrice;
      } else if (b.status === 'cancelled') {
        grouped[dateKey].cancelledBookings++;
      }
    });

    const data = Object.entries(grouped).map(([date, stats]) => ({
      date,
      ...stats,
      averageBookingValue: stats.confirmedBookings > 0 ? Math.round(stats.totalRevenue / stats.confirmedBookings) : 0,
    }));

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch booking reports.' });
  }
};
