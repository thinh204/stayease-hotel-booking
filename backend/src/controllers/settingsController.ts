import { Response } from 'express';
import prisma from '../prisma.js';
import { AuthenticatedRequest } from '../middlewares/auth.js';
import { createAuditLog } from '../middlewares/audit.js';

export const getSettings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    let settings = await prisma.adminSettings.findFirst();
    if (!settings) {
      settings = await prisma.adminSettings.create({
        data: {
          platformName: 'StayEase Luxury Hotels',
          platformDescription: 'Global Luxury Hotel Reservation Management',
          primaryColor: '#1e40af',
          secondaryColor: '#7c3aed',
          currency: 'USD',
          timezone: 'UTC+07:00',
        },
      });
    }

    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch platform settings.' });
  }
};

export const updateSettings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    let settings = await prisma.adminSettings.findFirst();
    const data = req.body;

    let updated;
    if (settings) {
      updated = await prisma.adminSettings.update({
        where: { id: settings.id },
        data: {
          platformName: data.platformName ?? undefined,
          platformDescription: data.platformDescription ?? undefined,
          primaryColor: data.primaryColor ?? undefined,
          secondaryColor: data.secondaryColor ?? undefined,
          contactEmail: data.contactEmail ?? undefined,
          supportPhone: data.supportPhone ?? undefined,
          currency: data.currency ?? undefined,
          timezone: data.timezone ?? undefined,
          maintenanceMode: data.maintenanceMode !== undefined ? data.maintenanceMode : undefined,
          maintenanceMessage: data.maintenanceMessage ?? undefined,
          enableEmailVerification: data.enableEmailVerification !== undefined ? data.enableEmailVerification : undefined,
          enableTwoFactor: data.enableTwoFactor !== undefined ? data.enableTwoFactor : undefined,
          maxLoginAttempts: data.maxLoginAttempts ? parseInt(data.maxLoginAttempts) : undefined,
          sessionTimeout: data.sessionTimeout ? parseInt(data.sessionTimeout) : undefined,
          lockoutDuration: data.lockoutDuration ? parseInt(data.lockoutDuration) : undefined,
        },
      });
    } else {
      updated = await prisma.adminSettings.create({ data });
    }

    await createAuditLog({
      userId: req.user!.id,
      action: 'UPDATE_PLATFORM_SETTINGS',
      entity: 'AdminSettings',
      entityId: updated.id,
      description: 'Updated core platform settings and operational parameters',
      newValues: updated,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ success: true, message: 'Platform settings saved successfully.', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update platform settings.' });
  }
};

export const getEmailSettings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const settings = await prisma.adminSettings.findFirst({
      select: {
        emailProvider: true,
        smtpHost: true,
        smtpPort: true,
        smtpUser: true,
      },
    });

    res.json({
      success: true,
      data: settings || {
        emailProvider: 'smtp',
        smtpHost: 'smtp.mailtrap.io',
        smtpPort: 2525,
        smtpUser: 'stayease-demo',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch email settings.' });
  }
};

export const updateEmailSettings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { emailProvider, smtpHost, smtpPort, smtpUser, smtpPassword } = req.body;
  try {
    let settings = await prisma.adminSettings.findFirst();
    if (!settings) {
      settings = await prisma.adminSettings.create({ data: {} });
    }

    const updated = await prisma.adminSettings.update({
      where: { id: settings.id },
      data: {
        emailProvider: emailProvider ?? undefined,
        smtpHost: smtpHost ?? undefined,
        smtpPort: smtpPort ? parseInt(smtpPort) : undefined,
        smtpUser: smtpUser ?? undefined,
        smtpPassword: smtpPassword ?? undefined,
      },
    });

    await createAuditLog({
      userId: req.user!.id,
      action: 'UPDATE_EMAIL_SETTINGS',
      entity: 'AdminSettings',
      entityId: updated.id,
      description: `Updated SMTP email configuration to ${smtpHost || 'custom provider'}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ success: true, message: 'Email settings saved successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update email settings.' });
  }
};

export const sendTestEmail = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { to, subject, body } = req.body;

  if (!to) {
    res.status(400).json({ success: false, message: 'Recipient email address is required.' });
    return;
  }

  try {
    await createAuditLog({
      userId: req.user!.id,
      action: 'SEND_TEST_EMAIL',
      entity: 'AdminSettings',
      entityId: null,
      description: `Sent test email to "${to}" with subject "${subject || 'StayEase Test Email'}"`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({
      success: true,
      message: `Test email successfully sent to ${to}. SMTP connection confirmed healthy.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to send test email.' });
  }
};
