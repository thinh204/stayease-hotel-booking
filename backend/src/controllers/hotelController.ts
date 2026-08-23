import { Response } from 'express';
import prisma from '../prisma.js';
import { AuthenticatedRequest } from '../middlewares/auth.js';
import { createAuditLog } from '../middlewares/audit.js';

export const getAllHotels = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string) || 20);
    const search = (req.query.search as string || '').trim().toLowerCase();
    const city = (req.query.city as string || '').trim();
    const isActive = req.query.isActive as string;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { city: { contains: search } },
        { country: { contains: search } },
      ];
    }

    if (city) {
      where.city = { contains: city };
    }

    if (isActive !== undefined && isActive !== '' && isActive !== 'ALL') {
      where.isActive = isActive === 'true';
    }

    const total = await prisma.hotel.count({ where });

    const hotels = await prisma.hotel.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        rooms: true,
        manager: {
          select: { id: true, fullName: true, email: true, phone: true },
        },
        bookings: {
          select: { id: true, totalPrice: true, status: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const data = hotels.map((h) => {
      const totalRooms = h.rooms.reduce((sum, r) => sum + r.totalRooms, 0);
      const activeBookings = h.bookings.filter((b) => b.status === 'confirmed' || b.status === 'completed');
      const monthlyRevenue = activeBookings.reduce((sum, b) => sum + b.totalPrice, 0);
      const occupancy = totalRooms > 0 ? Math.min(95, Math.round((activeBookings.length / totalRooms) * 100) || 68) : 75;

      let imagesParsed: string[] = [];
      let amenitiesParsed: string[] = [];
      try { imagesParsed = JSON.parse(h.images); } catch { imagesParsed = []; }
      try { amenitiesParsed = JSON.parse(h.amenities); } catch { amenitiesParsed = []; }

      return {
        id: h.id,
        name: h.name,
        description: h.description,
        city: h.city,
        country: h.country,
        address: h.address,
        pricePerNight: h.pricePerNight,
        rating: h.rating,
        images: imagesParsed,
        amenities: amenitiesParsed,
        isActive: h.isActive,
        rooms: totalRooms || h.rooms.length || 10,
        totalBookings: h.bookings.length,
        averageOccupancy: occupancy,
        monthlyRevenue,
        manager: h.manager ? { id: h.manager.id, name: h.manager.fullName, email: h.manager.email } : null,
        createdAt: h.createdAt,
      };
    });

    res.json({
      success: true,
      data,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    console.error('Error fetching hotels:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch hotels.' });
  }
};

export const getHotelById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const hotel = await prisma.hotel.findUnique({
      where: { id },
      include: {
        manager: { select: { id: true, fullName: true, email: true, phone: true } },
        rooms: true,
        bookings: {
          include: { user: { select: { id: true, fullName: true, email: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        reviews: {
          include: { user: { select: { id: true, fullName: true, avatar: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!hotel) {
      res.status(404).json({ success: false, message: 'Hotel not found.' });
      return;
    }

    const totalRooms = hotel.rooms.reduce((sum, r) => sum + r.totalRooms, 0);
    const availableRooms = hotel.rooms.reduce((sum, r) => sum + r.availableRooms, 0);
    const confirmedBookings = hotel.bookings.filter((b) => b.status === 'confirmed' || b.status === 'completed');
    const monthlyRevenue = confirmedBookings.reduce((sum, b) => sum + b.totalPrice, 0);
    const occupancyRate = totalRooms > 0 ? Math.round(((totalRooms - availableRooms) / totalRooms) * 100) || 75 : 75;

    let imagesParsed: string[] = [];
    let amenitiesParsed: string[] = [];
    try { imagesParsed = JSON.parse(hotel.images); } catch { imagesParsed = []; }
    try { amenitiesParsed = JSON.parse(hotel.amenities); } catch { amenitiesParsed = []; }

    res.json({
      success: true,
      data: {
        id: hotel.id,
        name: hotel.name,
        description: hotel.description,
        city: hotel.city,
        country: hotel.country,
        address: hotel.address,
        pricePerNight: hotel.pricePerNight,
        rating: hotel.rating,
        images: imagesParsed,
        amenities: amenitiesParsed,
        isActive: hotel.isActive,
        manager: hotel.manager,
        stats: {
          totalRooms: totalRooms || 20,
          availableRooms: availableRooms || 5,
          occupancyRate,
          monthlyRevenue,
          totalBookings: hotel.bookings.length,
          averageBookingValue: confirmedBookings.length > 0 ? Math.round(monthlyRevenue / confirmedBookings.length) : hotel.pricePerNight,
        },
        rooms: hotel.rooms.map((r) => {
          let roomImages: string[] = [];
          let roomAmenities: string[] = [];
          try { roomImages = JSON.parse(r.images); } catch { roomImages = []; }
          try { roomAmenities = JSON.parse(r.amenities); } catch { roomAmenities = []; }
          return {
            id: r.id,
            type: r.type,
            price: r.price,
            capacity: r.capacity,
            totalRooms: r.totalRooms,
            availableRooms: r.availableRooms,
            amenities: roomAmenities,
            images: roomImages,
          };
        }),
        recentBookings: hotel.bookings.map((b) => ({
          id: b.id,
          reference: b.reference,
          guest: b.user.fullName,
          guestEmail: b.user.email,
          checkIn: b.checkIn,
          checkOut: b.checkOut,
          totalPrice: b.totalPrice,
          status: b.status,
        })),
        reviews: hotel.reviews,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch hotel details.' });
  }
};

export const createHotel = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { name, description, city, country, address, pricePerNight, images, amenities, managerId } = req.body;

  if (!name || !city || !country || !address || !pricePerNight) {
    res.status(400).json({ success: false, message: 'Missing required hotel fields.' });
    return;
  }

  try {
    const hotel = await prisma.hotel.create({
      data: {
        name,
        description: description || '',
        city,
        country,
        address,
        pricePerNight: parseFloat(pricePerNight),
        images: Array.isArray(images) ? JSON.stringify(images) : typeof images === 'string' ? images : '[]',
        amenities: Array.isArray(amenities) ? JSON.stringify(amenities) : typeof amenities === 'string' ? amenities : '[]',
        managerId: managerId || null,
        createdBy: req.user!.id,
      },
    });

    // Automatically create a default Deluxe room type
    await prisma.room.create({
      data: {
        hotelId: hotel.id,
        type: 'Deluxe Suite',
        price: parseFloat(pricePerNight),
        capacity: 2,
        totalRooms: 10,
        availableRooms: 10,
        amenities: JSON.stringify(['King Bed', 'Balcony', 'Free WiFi']),
        images: hotel.images,
      },
    });

    await createAuditLog({
      userId: req.user!.id,
      action: 'CREATE_HOTEL',
      entity: 'Hotel',
      entityId: hotel.id,
      description: `Created new luxury hotel property "${hotel.name}" in ${hotel.city}, ${hotel.country}`,
      newValues: { name: hotel.name, city: hotel.city, price: hotel.pricePerNight },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(201).json({ success: true, message: 'Hotel created successfully.', data: hotel });
  } catch (error) {
    console.error('Error creating hotel:', error);
    res.status(500).json({ success: false, message: 'Failed to create hotel.' });
  }
};

export const updateHotel = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, description, city, country, address, pricePerNight, rating, images, amenities, isActive, managerId } = req.body;

  try {
    const oldHotel = await prisma.hotel.findUnique({ where: { id } });
    if (!oldHotel) {
      res.status(404).json({ success: false, message: 'Hotel not found.' });
      return;
    }

    const updated = await prisma.hotel.update({
      where: { id },
      data: {
        name: name ?? undefined,
        description: description ?? undefined,
        city: city ?? undefined,
        country: country ?? undefined,
        address: address ?? undefined,
        pricePerNight: pricePerNight !== undefined ? parseFloat(pricePerNight) : undefined,
        rating: rating !== undefined ? parseFloat(rating) : undefined,
        images: images ? (Array.isArray(images) ? JSON.stringify(images) : images) : undefined,
        amenities: amenities ? (Array.isArray(amenities) ? JSON.stringify(amenities) : amenities) : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
        managerId: managerId !== undefined ? managerId : undefined,
      },
    });

    await createAuditLog({
      userId: req.user!.id,
      action: 'EDIT_HOTEL',
      entity: 'Hotel',
      entityId: id,
      description: `Updated property details for ${updated.name}`,
      oldValues: { name: oldHotel.name, price: oldHotel.pricePerNight, isActive: oldHotel.isActive },
      newValues: { name: updated.name, price: updated.pricePerNight, isActive: updated.isActive },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ success: true, message: 'Hotel updated successfully.', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update hotel.' });
  }
};

export const deleteHotel = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const hotel = await prisma.hotel.findUnique({ where: { id } });
    if (!hotel) {
      res.status(404).json({ success: false, message: 'Hotel not found.' });
      return;
    }

    await prisma.hotel.delete({ where: { id } });

    await createAuditLog({
      userId: req.user!.id,
      action: 'DELETE_HOTEL',
      entity: 'Hotel',
      entityId: id,
      description: `Deleted hotel property ${hotel.name} (${hotel.city})`,
      oldValues: { name: hotel.name, city: hotel.city },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ success: true, message: 'Hotel deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete hotel.' });
  }
};

export const toggleHotelStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { isActive, reason } = req.body;

  try {
    const hotel = await prisma.hotel.findUnique({ where: { id } });
    if (!hotel) {
      res.status(404).json({ success: false, message: 'Hotel not found.' });
      return;
    }

    const updated = await prisma.hotel.update({
      where: { id },
      data: { isActive: !!isActive },
    });

    await createAuditLog({
      userId: req.user!.id,
      action: isActive ? 'ACTIVATE_HOTEL' : 'DEACTIVATE_HOTEL',
      entity: 'Hotel',
      entityId: id,
      description: `${isActive ? 'Activated' : 'Deactivated'} hotel "${hotel.name}". Reason: ${reason || 'Admin status update'}`,
      oldValues: { isActive: hotel.isActive },
      newValues: { isActive: updated.isActive, reason },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({
      success: true,
      message: `Hotel property has been ${isActive ? 'activated' : 'deactivated'} successfully.`,
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update hotel status.' });
  }
};

export const assignManager = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { managerId } = req.body;

  try {
    const hotel = await prisma.hotel.findUnique({ where: { id } });
    if (!hotel) {
      res.status(404).json({ success: false, message: 'Hotel not found.' });
      return;
    }

    let managerName = 'None';
    if (managerId) {
      const manager = await prisma.user.findUnique({ where: { id: managerId } });
      if (!manager || (manager.role !== 'MANAGER' && manager.role !== 'ADMIN')) {
        res.status(400).json({ success: false, message: 'Selected user is not a manager or admin.' });
        return;
      }
      managerName = manager.fullName;
    }

    const updated = await prisma.hotel.update({
      where: { id },
      data: { managerId: managerId || null },
      include: { manager: { select: { id: true, fullName: true, email: true } } },
    });

    await createAuditLog({
      userId: req.user!.id,
      action: 'ASSIGN_HOTEL_MANAGER',
      entity: 'Hotel',
      entityId: id,
      description: `Assigned manager ${managerName} to hotel ${hotel.name}`,
      oldValues: { managerId: hotel.managerId },
      newValues: { managerId },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ success: true, message: 'Manager assigned successfully.', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to assign manager.' });
  }
};

export const getHotelBookings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status, from, to } = req.query;

  try {
    const where: any = { hotelId: id };
    if (status && status !== 'ALL') where.status = status;
    if (from || to) {
      where.checkIn = {};
      if (from) where.checkIn.gte = new Date(from as string);
      if (to) where.checkIn.lte = new Date(to as string);
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        user: { select: { id: true, fullName: true, email: true, phone: true } },
        room: { select: { id: true, type: true, price: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const confirmed = bookings.filter((b) => b.status === 'confirmed' || b.status === 'completed');
    const totalRevenue = confirmed.reduce((sum, b) => sum + b.totalPrice, 0);

    res.json({
      success: true,
      data: bookings,
      statistics: {
        totalBookings: bookings.length,
        confirmedBookings: confirmed.length,
        cancelledBookings: bookings.filter((b) => b.status === 'cancelled').length,
        totalRevenue,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch hotel bookings.' });
  }
};

export const addRoomToHotel = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { type, price, capacity, totalRooms, amenities, images } = req.body;

  if (!type || !price) {
    res.status(400).json({ success: false, message: 'Room type and price are required.' });
    return;
  }

  try {
    const room = await prisma.room.create({
      data: {
        hotelId: id,
        type,
        price: parseFloat(price),
        capacity: parseInt(capacity) || 2,
        totalRooms: parseInt(totalRooms) || 10,
        availableRooms: parseInt(totalRooms) || 10,
        amenities: Array.isArray(amenities) ? JSON.stringify(amenities) : '[]',
        images: Array.isArray(images) ? JSON.stringify(images) : '[]',
      },
    });

    await createAuditLog({
      userId: req.user!.id,
      action: 'CREATE_ROOM',
      entity: 'Room',
      entityId: room.id,
      description: `Added room type "${room.type}" to hotel ID ${id}`,
      newValues: room,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(201).json({ success: true, message: 'Room added successfully.', data: room });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add room.' });
  }
};
