import prisma from '../prisma.js';

export interface AuditParams {
  userId: string;
  action: string;
  entity: string;
  entityId?: string | null;
  description: string;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string | null;
  userAgent?: string | null;
  status?: string;
  errorMessage?: string | null;
}

export async function createAuditLog(params: AuditParams) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId || null,
        description: params.description,
        oldValues: params.oldValues ? JSON.stringify(params.oldValues) : null,
        newValues: params.newValues ? JSON.stringify(params.newValues) : null,
        ipAddress: params.ipAddress || null,
        userAgent: params.userAgent || null,
        status: params.status || 'success',
        errorMessage: params.errorMessage || null,
      },
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
}
