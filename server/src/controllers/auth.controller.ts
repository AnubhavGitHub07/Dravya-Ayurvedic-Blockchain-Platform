import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'
import { sendSuccess, sendError } from '../lib/response'
import { registerSchema, loginSchema, publicRegistrationRoles } from '../lib/validators'
import { AuthenticatedRequest } from '../middleware/auth.middleware'

// ─── Helpers ─────────────────────────────────────────────

/** Fields safe to return in API responses (never includes password) */
const safeUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  organization: true,
  phone: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const

function generateToken(userId: string, role: string): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set.')
  }

  const expiresIn = process.env.JWT_EXPIRES_IN || '7d'

  return jwt.sign({ userId, role }, secret, {
    expiresIn: expiresIn as any,
  })
}

// ─── Controllers ─────────────────────────────────────────

/**
 * POST /api/auth/register
 *
 * Public registration for PRODUCER, LAB, DISTRIBUTOR only.
 * ADMIN and VERIFICATION_AUTHORITY roles are rejected —
 * they must be created through controlled mechanisms.
 */
export async function register(req: Request, res: Response): Promise<void> {
  try {
    // Validate input
    const validation = registerSchema.safeParse(req.body)
    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed.',
        errors: validation.error.flatten().fieldErrors,
      })
      return
    }

    const { name, email, password, role, organization, phone } = validation.data

    // Determine the effective role (default to PRODUCER)
    const effectiveRole = role || 'PRODUCER'

    // Block restricted roles from public registration
    if (!(publicRegistrationRoles as readonly string[]).includes(effectiveRole)) {
      sendError(
        res,
        `Registration as ${effectiveRole} is not available through public registration. Please contact an administrator.`,
        403
      )
      return
    }

    // Check for duplicate email
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      sendError(res, 'A user with this email already exists.', 409)
      return
    }

    // Hash password
    const salt = await bcrypt.genSalt(12)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: effectiveRole as any,
        organization,
        phone,
      },
      select: safeUserSelect,
    })

    const token = generateToken(user.id, user.role)

    sendSuccess(res, 'User registered successfully.', { user, token }, 201)
  } catch (error) {
    console.error('Register error:', error)
    sendError(res, 'Internal server error.', 500)
  }
}

/**
 * POST /api/auth/login
 *
 * Authenticates user by email + password and returns a JWT.
 * Does not reveal whether the email or password was incorrect.
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    // Validate input
    const validation = loginSchema.safeParse(req.body)
    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed.',
        errors: validation.error.flatten().fieldErrors,
      })
      return
    }

    const { email, password } = validation.data

    // Find user (need password for comparison)
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      sendError(res, 'Invalid email or password.', 401)
      return
    }

    // Check if account is active
    if (!user.isActive) {
      sendError(res, 'Account has been deactivated. Please contact an administrator.', 403)
      return
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      sendError(res, 'Invalid email or password.', 401)
      return
    }

    const token = generateToken(user.id, user.role)

    sendSuccess(res, 'Login successful.', {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization,
        phone: user.phone,
        isActive: user.isActive,
      },
      token,
    })
  } catch (error) {
    console.error('Login error:', error)
    sendError(res, 'Internal server error.', 500)
  }
}

/**
 * GET /api/auth/me
 *
 * Returns the authenticated user's profile (requires valid JWT).
 */
export async function getMe(req: Request, res: Response): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest
    const userId = authReq.user?.id

    if (!userId) {
      sendError(res, 'Authentication required.', 401)
      return
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: safeUserSelect,
    })

    if (!user) {
      sendError(res, 'User not found.', 404)
      return
    }

    sendSuccess(res, 'User profile retrieved.', { user })
  } catch (error) {
    console.error('GetMe error:', error)
    sendError(res, 'Internal server error.', 500)
  }
}
