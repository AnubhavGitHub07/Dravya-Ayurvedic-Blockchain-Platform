import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { AuthenticatedRequest } from '../middleware/auth.middleware'
import { sendSuccess, sendError } from '../lib/response'
import { paginationSchema } from '../lib/validators'

// ─── Helpers ─────────────────────────────────────────────

function getParamString(param: string | string[] | undefined): string | undefined {
  if (Array.isArray(param)) return param[0]
  return param
}

function getQueryString(param: unknown): string | undefined {
  if (typeof param === 'string') return param
  if (Array.isArray(param) && typeof param[0] === 'string') return param[0]
  return undefined
}

// ─── Controllers ─────────────────────────────────────────

export async function getAllUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (req.user!.role !== 'ADMIN') {
      sendError(res, 'Only admins can perform this action.', 403)
      return
    }
    const { page, limit } = paginationSchema.parse(req.query)
    const role = getQueryString(req.query.role)
    const skip = (page - 1) * limit

    const where = role ? { role: role as any } : {}

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          _count: {
            select: {
              qualityTests: true,
              supplyChainEvents: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ])

    sendSuccess(res, 'Users retrieved successfully', {
      items: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get users error:', error)
    sendError(res, 'Internal server error', 500)
  }
}

export async function getUserById(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (req.user!.role !== 'ADMIN' && req.user!.id !== req.params.id) {
      sendError(res, 'Forbidden.', 403)
      return
    }
    const id = getParamString(req.params.id)
    if (!id) {
      sendError(res, 'User ID is required.', 400)
      return
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        producerProfile: {
          select: {
            id: true,
            batches: {
              select: { id: true, batchNumber: true, status: true, createdAt: true },
              orderBy: { createdAt: 'desc' },
              take: 10,
            },
          },
        },
        _count: {
          select: {
            qualityTests: true,
            supplyChainEvents: true,
          },
        },
      },
    })

    if (!user) {
      sendError(res, 'User not found.', 404)
      return
    }

    sendSuccess(res, 'User retrieved successfully', { user })
  } catch (error) {
    console.error('Get user error:', error)
    sendError(res, 'Internal server error', 500)
  }
}

export async function toggleUserStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const id = getParamString(req.params.id)
    if (!id) {
      sendError(res, 'User ID is required.', 400)
      return
    }

    // Only admins can toggle user status
    if (req.user!.role !== 'ADMIN') {
      sendError(res, 'Only admins can perform this action.', 403)
      return
    }

    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) {
      sendError(res, 'User not found.', 404)
      return
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    })

    sendSuccess(res, `User ${updatedUser.isActive ? 'activated' : 'deactivated'} successfully`, {
      user: updatedUser,
    })
  } catch (error) {
    console.error('Toggle user status error:', error)
    sendError(res, 'Internal server error', 500)
  }
}
