import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'
import { Role } from '@prisma/client'

// ─── Types ───────────────────────────────────────────────

export interface AuthenticatedUser {
  id: string
  role: Role
  name: string
  email: string
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser
  /** @deprecated Use req.user.id instead — kept for backward compat with Step 1 controllers */
  userId?: string
  /** @deprecated Use req.user.role instead — kept for backward compat with Step 1 controllers */
  userRole?: string
}

interface JwtPayload {
  userId: string
  role: string
}

// ─── Authenticate Middleware ─────────────────────────────

/**
 * Verifies the JWT token from the Authorization header,
 * looks up the user in the database, checks that the account
 * is active, and attaches the user to the request.
 */
export function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Access denied. No token provided.' })
    return
  }

  const token = authHeader.split(' ')[1]
  const secret = process.env.JWT_SECRET

  if (!secret) {
    console.error('FATAL: JWT_SECRET environment variable is not set.')
    res.status(500).json({ success: false, message: 'Internal server error.' })
    return
  }

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload

    // Look up the user in the database to ensure they still exist and are active
    prisma.user
      .findUnique({
        where: { id: decoded.userId },
        select: { id: true, role: true, name: true, email: true, isActive: true },
      })
      .then((user) => {
        if (!user) {
          res.status(401).json({ success: false, message: 'User no longer exists.' })
          return
        }

        if (!user.isActive) {
          res.status(403).json({ success: false, message: 'Account has been deactivated.' })
          return
        }

        // Attach user to request
        req.user = {
          id: user.id,
          role: user.role,
          name: user.name,
          email: user.email,
        }

        // Backward compatibility with Step 1 controllers
        req.userId = user.id
        req.userRole = user.role

        next()
      })
      .catch((err) => {
        console.error('Auth middleware DB error:', err)
        res.status(500).json({ success: false, message: 'Internal server error.' })
      })
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token.' })
  }
}

// ─── Legacy alias ────────────────────────────────────────
/** @deprecated Use `authenticate` instead */
export const authMiddleware = authenticate
