import { prisma } from '../lib/prisma'
import { AuditAction } from '@prisma/client'

export interface AuditRecordPayload {
  action: AuditAction
  actorId?: string
  entityType?: string
  entityId?: string
  previousState?: any
  newState?: any
  metadata?: any
  ipAddress?: string
  userAgent?: string
}

export class AuditService {
  /**
   * Centralized method to record an audit log event.
   * Fails silently (logs to console) if creation fails,
   * to avoid breaking primary business transactions unless explicitly required.
   */
  static async record(payload: AuditRecordPayload): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          action: payload.action,
          actorId: payload.actorId,
          entityType: payload.entityType,
          entityId: payload.entityId,
          previousState: payload.previousState || null,
          newState: payload.newState || null,
          metadata: payload.metadata || null,
          ipAddress: payload.ipAddress,
          userAgent: payload.userAgent,
        },
      })
    } catch (error) {
      console.error('Failed to create audit log:', error)
      // Do not rethrow by default, so we don't break business logic
    }
  }

  static async recordStateChange(payload: AuditRecordPayload): Promise<void> {
    await this.record(payload)
  }

  static async recordSecurityEvent(payload: AuditRecordPayload): Promise<void> {
    await this.record(payload)
  }
}
