import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { sendSuccess, sendError } from '../lib/response'
import { paginationSchema } from '../lib/validators'

export async function getAuditLogs(req: Request, res: Response): Promise<void> {
  try {
    const { page, limit } = paginationSchema.parse(req.query)
    
    const action = req.query.action as any
    const entityType = req.query.entityType as string | undefined
    const entityId = req.query.entityId as string | undefined
    const actorId = req.query.actorId as string | undefined
    
    const whereClause: any = {}
    if (action) whereClause.action = action
    if (entityType) whereClause.entityType = entityType
    if (entityId) whereClause.entityId = entityId
    if (actorId) whereClause.actorId = actorId

    // Capped limit to 50 as per requirement
    const finalLimit = Math.min(limit, 50)
    const skip = (page - 1) * finalLimit

    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where: whereClause }),
      prisma.auditLog.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: finalLimit,
        include: {
          actor: {
            select: { id: true, name: true, email: true, role: true }
          }
        }
      })
    ])

    const totalPages = Math.ceil(total / finalLimit)

    sendSuccess(res, 'Audit logs retrieved successfully.', {
      data: logs,
      pagination: {
        total,
        page,
        limit: finalLimit,
        totalPages
      }
    })
  } catch (error) {
    console.error('getAuditLogs Error:', error)
    sendError(res, 'Internal server error', 500)
  }
}

export async function getAuditLogById(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;

    const log = await prisma.auditLog.findUnique({
      where: { id },
      include: {
        actor: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    })

    if (!log) {
      sendError(res, 'Audit log not found.', 404)
      return
    }

    sendSuccess(res, 'Audit log retrieved successfully.', { data: log })
  } catch (error) {
    console.error('getAuditLogById Error:', error)
    sendError(res, 'Internal server error', 500)
  }
}
