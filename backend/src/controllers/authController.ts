import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prisma.js';
import { AuthenticatedRequest } from '../middlewares/auth.js';
import { createAuditLog } from '../middlewares/audit.js';

export const loginAdmin = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { email, password } = req.body;
  const ipAddress = req.ip || req.headers['x-forwarded-for'] as string;
  const userAgent = req.headers['user-agent'];

  if (!email || !password) {
    res.status(400).json({ success: false, message: 'Email and password are required.' });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid credentials.' });
      return;
    }

    if (user.isLocked) {
      res.status(403).json({
        success: false,
        message: 'Account is locked. Please contact the system administrator.',
      });
      return;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      const attempts = user.loginAttempts + 1;
      const shouldLock = attempts >= 5;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          loginAttempts: attempts,
          isLocked: shouldLock,
          lockedUntil: shouldLock ? new Date(Date.now() + 30 * 60000) : null,
        },
      });

      if (shouldLock) {
        await createAuditLog({
          userId: user.id,
          action: 'ACCOUNT_LOCKED_FAILED_LOGINS',
          entity: 'User',
          entityId: user.id,
          description: `Account auto-locked after ${attempts} failed login attempts.`,
          ipAddress,
          userAgent,
          status: 'error',
        });
      }

      res.status(401).json({ success: false, message: 'Invalid credentials.' });
      return;
    }

    // Role check: Only ADMIN and MANAGER can login via Admin portal
    if (user.role !== 'ADMIN' && user.role !== 'MANAGER') {
      res.status(403).json({
        success: false,
        message: 'Access restricted: Staff or Administrator privileges required.',
      });
      return;
    }

    // Reset login attempts & update lastLogin
    await prisma.user.update({
      where: { id: user.id },
      data: { loginAttempts: 0, lastLogin: new Date() },
    });

    const secret = process.env.JWT_SECRET || 'stayease_default_secret';
    const expiresIn = process.env.JWT_EXPIRES_IN || '24h';

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      secret,
      { expiresIn: expiresIn as any }
    );

    await createAuditLog({
      userId: user.id,
      action: 'ADMIN_LOGIN',
      entity: 'Auth',
      entityId: user.id,
      description: `User ${user.fullName} (${user.role}) logged in successfully.`,
      ipAddress,
      userAgent,
      status: 'success',
    });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
        bio: user.bio,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error during login.' });
  }
};

export const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        avatar: true,
        bio: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'Profile not found.' });
      return;
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch admin profile.' });
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { fullName, phone, bio, avatar } = req.body;
  try {
    const updated = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        fullName: fullName ?? undefined,
        phone: phone ?? undefined,
        bio: bio ?? undefined,
        avatar: avatar ?? undefined,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        avatar: true,
        bio: true,
        role: true,
      },
    });

    await createAuditLog({
      userId: req.user!.id,
      action: 'UPDATE_PROFILE',
      entity: 'User',
      entityId: req.user!.id,
      description: `Admin profile updated for ${updated.fullName}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ success: true, message: 'Profile updated successfully', user: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update admin profile.' });
  }
};

export const changePassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    res.status(400).json({ success: false, message: 'Old and new passwords are required.' });
    return;
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      res.status(400).json({ success: false, message: 'Incorrect old password.' });
      return;
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: newHash },
    });

    await createAuditLog({
      userId: user.id,
      action: 'CHANGE_PASSWORD',
      entity: 'User',
      entityId: user.id,
      description: 'Password changed successfully',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to change password.' });
  }
};

export const logoutAdmin = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (req.user) {
    await createAuditLog({
      userId: req.user.id,
      action: 'ADMIN_LOGOUT',
      entity: 'Auth',
      entityId: req.user.id,
      description: `User ${req.user.fullName} logged out.`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }
  res.json({ success: true, message: 'Logged out successfully.' });
};
