import { Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../prisma.js';
import { AuthenticatedRequest } from '../middlewares/auth.js';
import { createAuditLog } from '../middlewares/audit.js';

export const getAllUsers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string) || 20);
    const search = (req.query.search as string || '').trim().toLowerCase();
    const role = (req.query.role as string || '').trim();
    const isActive = req.query.isActive as string;
    const sortField = (req.query.sort as string) || 'createdAt';
    const sortOrder = (req.query.order as string) === 'asc' ? 'asc' : 'desc';

    const where: any = {};

    if (search) {
      where.OR = [
        { fullName: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    if (role && role !== 'ALL') {
      where.role = role;
    }

    if (isActive !== undefined && isActive !== '' && isActive !== 'ALL') {
      where.isActive = isActive === 'true';
    }

    const total = await prisma.user.count({ where });

    const users = await prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortField]: sortOrder },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        avatar: true,
        bio: true,
        role: true,
        isActive: true,
        isLocked: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        bookings: {
          select: {
            id: true,
            totalPrice: true,
            status: true,
          },
        },
      },
    });

    const data = users.map((u) => {
      const completedBookings = u.bookings.filter((b) => b.status === 'completed' || b.status === 'confirmed');
      const totalSpent = completedBookings.reduce((sum, b) => sum + b.totalPrice, 0);
      return {
        id: u.id,
        email: u.email,
        fullName: u.fullName,
        phone: u.phone,
        avatar: u.avatar,
        bio: u.bio,
        role: u.role,
        isActive: u.isActive,
        isLocked: u.isLocked,
        lastLogin: u.lastLogin,
        createdAt: u.createdAt,
        totalBookings: u.bookings.length,
        totalSpent,
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
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch users.' });
  }
};

export const getUserById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        bookings: {
          include: {
            hotel: { select: { id: true, name: true, city: true, country: true } },
            room: { select: { id: true, type: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        reviews: {
          include: {
            hotel: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const completedBookings = user.bookings.filter((b) => b.status === 'completed' || b.status === 'confirmed');
    const totalSpent = completedBookings.reduce((sum, b) => sum + b.totalPrice, 0);
    const averageSpending = completedBookings.length > 0 ? Math.round(totalSpent / completedBookings.length) : 0;

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        avatar: user.avatar,
        bio: user.bio,
        role: user.role,
        isActive: user.isActive,
        isLocked: user.isLocked,
        loginAttempts: user.loginAttempts,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        bookings: user.bookings,
        reviews: user.reviews,
        statistics: {
          totalBookings: user.bookings.length,
          totalSpent,
          averageSpending,
          lastBookingDate: user.bookings[0]?.createdAt || null,
          memberSince: user.createdAt,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch user details.' });
  }
};

export const createUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { email, password, fullName, phone, role, bio, avatar } = req.body;

  if (!email || !password || !fullName) {
    res.status(400).json({ success: false, message: 'Email, password, and full name are required.' });
    return;
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existing) {
      res.status(400).json({ success: false, message: 'User with this email already exists.' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        fullName,
        phone: phone || null,
        role: role || 'USER',
        bio: bio || null,
        avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fullName)}`,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    await createAuditLog({
      userId: req.user!.id,
      action: 'CREATE_USER',
      entity: 'User',
      entityId: newUser.id,
      description: `Created new user ${newUser.fullName} with role ${newUser.role}`,
      newValues: newUser,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(201).json({ success: true, message: 'User created successfully.', data: newUser });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to create user.' });
  }
};

export const updateUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { fullName, phone, role, isActive, bio, avatar } = req.body;

  try {
    const oldUser = await prisma.user.findUnique({ where: { id } });
    if (!oldUser) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        fullName: fullName ?? undefined,
        phone: phone ?? undefined,
        role: role ?? undefined,
        isActive: isActive !== undefined ? isActive : undefined,
        bio: bio ?? undefined,
        avatar: avatar ?? undefined,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        isActive: true,
        isLocked: true,
        updatedAt: true,
      },
    });

    await createAuditLog({
      userId: req.user!.id,
      action: 'EDIT_USER',
      entity: 'User',
      entityId: id,
      description: `Updated profile & settings for user ${updated.fullName}`,
      oldValues: { fullName: oldUser.fullName, role: oldUser.role, isActive: oldUser.isActive },
      newValues: { fullName: updated.fullName, role: updated.role, isActive: updated.isActive },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ success: true, message: 'User updated successfully.', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update user.' });
  }
};

export const deleteUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  if (req.user?.id === id) {
    res.status(400).json({ success: false, message: 'You cannot delete your own admin account.' });
    return;
  }

  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    await prisma.user.delete({ where: { id } });

    await createAuditLog({
      userId: req.user!.id,
      action: 'DELETE_USER',
      entity: 'User',
      entityId: id,
      description: `Deleted user ${user.fullName} (${user.email})`,
      oldValues: { email: user.email, fullName: user.fullName, role: user.role },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ success: true, message: 'User deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete user.' });
  }
};

export const changeUserRole = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { role } = req.body;

  if (!['USER', 'MANAGER', 'ADMIN'].includes(role)) {
    res.status(400).json({ success: false, message: 'Invalid role specified.' });
    return;
  }

  try {
    const oldUser = await prisma.user.findUnique({ where: { id } });
    if (!oldUser) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, email: true, fullName: true, role: true },
    });

    await createAuditLog({
      userId: req.user!.id,
      action: 'CHANGE_USER_ROLE',
      entity: 'User',
      entityId: id,
      description: `Changed role for ${updated.fullName} from ${oldUser.role} to ${role}`,
      oldValues: { role: oldUser.role },
      newValues: { role },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ success: true, message: 'User role updated successfully.', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to change role.' });
  }
};

export const lockUnlockUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { isLocked, reason } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        isLocked: !!isLocked,
        loginAttempts: isLocked ? user.loginAttempts : 0,
        lockedUntil: isLocked ? new Date(Date.now() + 7 * 86400000) : null,
      },
      select: { id: true, email: true, fullName: true, isLocked: true },
    });

    await createAuditLog({
      userId: req.user!.id,
      action: isLocked ? 'LOCK_USER' : 'UNLOCK_USER',
      entity: 'User',
      entityId: id,
      description: `${isLocked ? 'Locked' : 'Unlocked'} account for ${user.fullName}. Reason: ${reason || 'Admin action'}`,
      oldValues: { isLocked: user.isLocked },
      newValues: { isLocked: updated.isLocked, reason },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({
      success: true,
      message: `User account ${isLocked ? 'locked' : 'unlocked'} successfully.`,
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update user lock status.' });
  }
};

export const resetUserPassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    return;
  }

  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword, loginAttempts: 0, isLocked: false },
    });

    await createAuditLog({
      userId: req.user!.id,
      action: 'ADMIN_RESET_PASSWORD',
      entity: 'User',
      entityId: id,
      description: `Reset password for user ${user.fullName} (${user.email})`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ success: true, message: 'User password has been reset successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to reset password.' });
  }
};

export const getUserActivity = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const auditLogs = await prisma.auditLog.findMany({
      where: { userId: id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const bookings = await prisma.booking.findMany({
      where: { userId: id },
      include: { hotel: { select: { name: true, city: true } } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    res.json({
      success: true,
      loginHistory: auditLogs.filter((l) => l.action.includes('LOGIN')).map((l) => ({
        date: l.createdAt,
        ipAddress: l.ipAddress || '192.168.1.1',
        userAgent: l.userAgent || 'Chrome/Browser',
        status: l.status,
      })),
      auditLogs,
      bookingHistory: bookings.map((b) => ({
        date: b.createdAt,
        hotel: b.hotel.name,
        city: b.hotel.city,
        status: b.status,
        totalPrice: b.totalPrice,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch user activity.' });
  }
};
