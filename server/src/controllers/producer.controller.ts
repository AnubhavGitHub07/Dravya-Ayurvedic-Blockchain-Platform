import { Response } from 'express'
import { prisma } from '../lib/prisma'
import { sendSuccess, sendError } from '../lib/response'
import { producerProfileSchema } from '../lib/validators'
import { AuthenticatedRequest } from '../middleware/auth.middleware'
import { AuditService } from '../services/audit.service'

// ─── Helpers ─────────────────────────────────────────────

const safeProfileSelect = {
  id: true,
  farmName: true,
  address: true,
  village: true,
  tehsil: true,
  district: true,
  state: true,
  pincode: true,
  latitude: true,
  longitude: true,
  landSize: true,
  landSizeUnit: true,
  verificationStatus: true,
  createdAt: true,
  updatedAt: true,
}

// ─── Controllers ─────────────────────────────────────────

export async function getMyProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id

    const profile = await prisma.producerProfile.findUnique({
      where: { userId },
      select: safeProfileSelect,
    })

    if (!profile) {
      sendError(res, 'Producer profile not found. Please complete your profile setup.', 404)
      return
    }

    sendSuccess(res, 'Producer profile retrieved successfully.', { profile })
  } catch (error) {
    console.error('Get profile error:', error)
    sendError(res, 'Internal server error.', 500)
  }
}

export async function updateMyProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id

    const validation = producerProfileSchema.safeParse(req.body)
    if (!validation.success) {
      sendError(res, 'Validation failed.', 400, validation.error.flatten().fieldErrors)
      return
    }

    const profileData = validation.data

    const existingProfile = await prisma.producerProfile.findUnique({ where: { userId } })

    const profile = await prisma.producerProfile.upsert({
      where: { userId },
      update: profileData,
      create: {
        ...profileData,
        userId,
      },
      select: safeProfileSelect,
    })

    await AuditService.recordStateChange({
      action: existingProfile ? 'PRODUCER_PROFILE_UPDATED' : 'PRODUCER_PROFILE_CREATED',
      actorId: userId,
      entityType: 'ProducerProfile',
      entityId: profile.id,
      previousState: existingProfile || null,
      newState: profile,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    })

    sendSuccess(res, 'Producer profile updated successfully.', { profile })
  } catch (error) {
    console.error('Update profile error:', error)
    sendError(res, 'Internal server error.', 500)
  }
}

export async function getMyVerificationStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id

    const profile = await prisma.producerProfile.findUnique({
      where: { userId },
      select: { verificationStatus: true },
    })

    if (!profile) {
      sendError(res, 'Producer profile not found.', 404)
      return
    }

    sendSuccess(res, 'Verification status retrieved.', { status: profile.verificationStatus })
  } catch (error) {
    console.error('Get verification status error:', error)
    sendError(res, 'Internal server error.', 500)
  }
}

export async function getMyDashboard(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id

    const profile = await prisma.producerProfile.findUnique({
      where: { userId },
      select: { id: true },
    })

    if (!profile) {
      sendSuccess(res, 'Dashboard summary', {
        dashboard: {
          totalBatches: 0,
          draftBatches: 0,
          pendingVerification: 0,
          verifiedBatches: 0,
          rejectedBatches: 0,
        },
        recentBatches: [],
      })
      return
    }

    const [total, draft, pending, verified, rejected, recentBatches] = await Promise.all([
      prisma.batch.count({ where: { producerProfileId: profile.id } }),
      prisma.batch.count({ where: { producerProfileId: profile.id, status: 'DRAFT' } }),
      prisma.batch.count({ where: { producerProfileId: profile.id, status: 'PENDING_VERIFICATION' } }),
      prisma.batch.count({ where: { producerProfileId: profile.id, status: 'VERIFIED' } }),
      prisma.batch.count({ where: { producerProfileId: profile.id, status: 'REJECTED' } }),
      prisma.batch.findMany({
        where: { producerProfileId: profile.id },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { herb: { select: { commonName: true, botanicalName: true } } },
      }),
    ])

    sendSuccess(res, 'Dashboard summary retrieved.', {
      dashboard: {
        totalBatches: total,
        draftBatches: draft,
        pendingVerification: pending,
        verifiedBatches: verified,
        rejectedBatches: rejected,
      },
      recentBatches,
    })
  } catch (error) {
    console.error('Get dashboard error:', error)
    sendError(res, 'Internal server error.', 500)
  }
}

export async function getBatchQualityStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id
    const batchId = req.params.id as string

    const batch = await prisma.batch.findUnique({
      where: { id: batchId },
      include: {
        producerProfile: true,
        inspections: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        qualityTests: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: { reports: { where: { status: 'FINALIZED' } } }
        }
      }
    })

    if (!batch) {
      sendError(res, 'Batch not found.', 404)
      return
    }

    if (batch.producerProfile.userId !== userId) {
      sendError(res, 'Forbidden. You do not own this batch.', 403)
      return
    }

    const latestInspection = batch.inspections[0] || null
    const latestTest = batch.qualityTests[0] || null

    sendSuccess(res, 'Batch quality status retrieved.', {
      batch: {
        id: batch.id,
        batchNumber: batch.batchNumber,
        status: batch.status,
      },
      governmentVerification: {
        status: latestInspection?.status || 'N/A',
        decision: latestInspection?.decision || 'N/A'
      },
      laboratoryTest: {
        status: latestTest?.status || 'N/A',
        overallResult: latestTest?.overallResult || 'N/A',
        reportAvailable: latestTest?.reports && latestTest.reports.length > 0
      }
    })

  } catch (error) {
    console.error('Get batch quality status error:', error)
    sendError(res, 'Internal server error.', 500)
  }
}
