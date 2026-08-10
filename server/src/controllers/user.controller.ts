import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { AuthenticatedRequest } from '../middleware/auth.middleware'

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

export async function getAllUsers(req: Request, res: Response): Promise<void> {
  try {
    const page = parseInt(getQueryString(req.query.page) || '1')
    const limit = parseInt(getQueryString(req.query.limit) || '10')
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

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get users error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export async function getUserById(req: Request, res: Response): Promise<void> {
  try {
    const id = getParamString(req.params.id)
    if (!id) {
      res.status(400).json({ error: 'User ID is required.' })
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
      res.status(404).json({ error: 'User not found.' })
      return
    }

    res.json({ user })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export async function toggleUserStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const id = getParamString(req.params.id)
    if (!id) {
      res.status(400).json({ error: 'User ID is required.' })
      return
    }

    // Only admins can toggle user status
    if (req.userRole !== 'ADMIN') {
      res.status(403).json({ error: 'Only admins can perform this action.' })
      return
    }

    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) {
      res.status(404).json({ error: 'User not found.' })
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

    res.json({
      message: `User ${updatedUser.isActive ? 'activated' : 'deactivated'} successfully`,
      user: updatedUser,
    })
  } catch (error) {
    console.error('Toggle user status error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
