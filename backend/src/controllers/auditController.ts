import { Response } from 'express';
import prisma from '../prisma.js';
import { AuthenticatedRequest } from '../middlewares/auth.js';

export const getAuditLogs = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string) || 50);
    const action = req.query.action as string;
    const entity = req.query.entity as string;
    const from = req.query.from as string;
    const to = req.query.to as string;

    const where: any = {};
    if (action && action !== 'ALL') where.action = action;
    if (entity && entity !== 'ALL') where.entity = entity;
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    const total = await prisma.auditLog.count({ where });

    const logs = await prisma.auditLog.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: { select: { id: true, fullName: true, email: true, role: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const data = logs.map((l) => {
      let oldVals = null;
      let newVals = null;
      try { if (l.oldValues) oldVals = JSON.parse(l.oldValues); } catch {}
      try { if (l.newValues) newVals = JSON.parse(l.newValues); } catch {}

      return {
        id: l.id,
        user: {
          id: l.user.id,
          name: l.user.fullName,
          email: l.user.email,
          role: l.user.role,
          avatar: l.user.avatar,
        },
        action: l.action,
        entity: l.entity,
        entityId: l.entityId,
        description: l.description,
        oldValues: oldVals,
        newValues: newVals,
        ipAddress: l.ipAddress || '192.168.1.1',
        userAgent: l.userAgent,
        status: l.status,
        timestamp: l.createdAt,
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
    console.error('Audit logs error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch audit logs.' });
  }
};

export const getUserAuditLogs = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { userId } = req.params;
  try {
    const logs = await prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch user audit logs.' });
  }
};

export const exportAuditLogs = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const logs = await prisma.auditLog.findMany({
      include: { user: { select: { fullName: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });

    let csv = 'ID,Timestamp,User Name,User Email,Action,Entity,Entity ID,Description,Status,IP Address\n';
    logs.forEach((l) => {
      csv += `"${l.id}","${l.createdAt.toISOString()}","${l.user.fullName}","${l.user.email}","${l.action}","${l.entity}","${l.entityId || ''}","${l.description.replace(/"/g, '""')}","${l.status}","${l.ipAddress || ''}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="stayease-audit-logs.csv"');
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to export audit logs.' });
  }
};
