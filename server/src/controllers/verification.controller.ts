import { Response } from 'express'
import { prisma } from '../lib/prisma'
import { sendSuccess, sendError } from '../lib/response'
import { AuthenticatedRequest } from '../middleware/auth.middleware'
import { approveVerificationSchema, rejectVerificationSchema } from '../lib/validators'
import { BlockchainService } from '../services/blockchain.service'
import { HashingService } from '../services/hashing.service'
import { Role } from '@prisma/client'
// ─── PRODUCER ROUTES ─────────────────────────────────────

export async function requestVerification(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id

    const profile = await prisma.producerProfile.findUnique({
      where: { userId },
      include: {
        verifications: {
          where: {
            status: { in: ['PENDING', 'ASSIGNED', 'UNDER_REVIEW'] }
          }
        }
      }
    })

    if (!profile) {
      sendError(res, 'Producer profile not found.', 404)
      return
    }

    if (profile.verifications.length > 0) {
      sendError(res, 'An active verification request already exists.', 400)
      return
    }

    const verification = await prisma.$transaction(async (tx) => {
      // Create request
      const reqRecord = await tx.producerVerification.create({
        data: {
          producerProfileId: profile.id,
          status: 'PENDING',
        }
      })
      
      // Update profile status
      await tx.producerProfile.update({
        where: { id: profile.id },
        data: { verificationStatus: 'UNDER_REVIEW' }
      })

      return reqRecord
    })

    sendSuccess(res, 'Verification requested successfully.', { verification }, 201)
  } catch (error) {
    console.error('Request verification error:', error)
    sendError(res, 'Internal server error.', 500)
  }
}

export async function getVerificationHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id

    const profile = await prisma.producerProfile.findUnique({
      where: { userId },
    })

    if (!profile) {
      sendError(res, 'Producer profile not found.', 404)
      return
    }

    const verifications = await prisma.producerVerification.findMany({
      where: { producerProfileId: profile.id },
      orderBy: { createdAt: 'desc' },
      include: { authority: { select: { name: true } } }
    })

    sendSuccess(res, 'Verification history retrieved successfully.', { verifications })
  } catch (error) {
    console.error('Get verification history error:', error)
    sendError(res, 'Internal server error.', 500)
  }
}

// ─── AUTHORITY ROUTES ────────────────────────────────────

export async function getAssignedVerifications(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const authorityId = req.user!.id

    const verifications = await prisma.producerVerification.findMany({
      where: { authorityId },
      orderBy: { createdAt: 'desc' },
      include: {
        producerProfile: {
          include: { user: { select: { name: true, email: true, phone: true } } }
        }
      }
    })

    sendSuccess(res, 'Assigned verifications retrieved successfully.', { verifications })
  } catch (error) {
    console.error('Get assigned verifications error:', error)
    sendError(res, 'Internal server error.', 500)
  }
}

export async function getVerificationDetails(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const authorityId = req.user!.id
    const id = req.params.id as string

    const verification = await prisma.producerVerification.findUnique({
      where: { id },
      include: {
        producerProfile: {
          include: { 
            user: { select: { name: true, email: true, phone: true } },
            verificationDocuments: true
          }
        }
      }
    })

    if (!verification) {
      sendError(res, 'Verification record not found.', 404)
      return
    }

    if (verification.authorityId !== authorityId) {
      sendError(res, 'Forbidden. You are not assigned to this verification.', 403)
      return
    }

    sendSuccess(res, 'Verification details retrieved successfully.', { verification })
  } catch (error) {
    console.error('Get verification details error:', error)
    sendError(res, 'Internal server error.', 500)
  }
}

export async function approveVerification(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const authorityId = req.user!.id
    const id = req.params.id as string

    const validation = approveVerificationSchema.safeParse(req.body)
    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed.',
        errors: validation.error.flatten().fieldErrors,
      })
      return
    }

    const verification = await prisma.producerVerification.findUnique({
      where: { id }
    })

    if (!verification) {
      sendError(res, 'Verification record not found.', 404)
      return
    }

    if (verification.authorityId !== authorityId) {
      sendError(res, 'Forbidden. You are not assigned to this verification.', 403)
      return
    }

    if (verification.status === 'COMPLETED') {
      sendError(res, 'This verification has already been completed.', 400)
      return
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Update verification record
      const updatedVer = await tx.producerVerification.update({
        where: { id },
        data: {
          ...validation.data,
          status: 'COMPLETED',
          decision: 'APPROVED',
        }
      })

      // 2. Update profile
      await tx.producerProfile.update({
        where: { id: verification.producerProfileId },
        data: { verificationStatus: 'VERIFIED' }
      })

      // 3. Optional: Add audit event here if we had a generic audit model.

      return updatedVer
    })

    // STEP 6: Automatic Blockchain Anchoring
    const payload = HashingService.getProducerVerificationPayload(result)
    BlockchainService.anchorRecord('PRODUCER_VERIFICATION', result.id, 1, payload, req.user!.role as Role).catch(err => {
      console.error('Failed to trigger async blockchain anchor for PV:', err)
    })

    sendSuccess(res, 'Producer verification approved successfully.', { verification: result })
  } catch (error) {
    console.error('Approve verification error:', error)
    sendError(res, 'Internal server error.', 500)
  }
}

export async function rejectVerification(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const authorityId = req.user!.id
    const id = req.params.id as string

    const validation = rejectVerificationSchema.safeParse(req.body)
    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed.',
        errors: validation.error.flatten().fieldErrors,
      })
      return
    }

    const verification = await prisma.producerVerification.findUnique({
      where: { id }
    })

    if (!verification) {
      sendError(res, 'Verification record not found.', 404)
      return
    }

    if (verification.authorityId !== authorityId) {
      sendError(res, 'Forbidden. You are not assigned to this verification.', 403)
      return
    }

    if (verification.status === 'COMPLETED') {
      sendError(res, 'This verification has already been completed.', 400)
      return
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Update verification record
      const updatedVer = await tx.producerVerification.update({
        where: { id },
        data: {
          rejectionReason: validation.data.rejectionReason,
          status: 'COMPLETED',
          decision: 'REJECTED',
        }
      })

      // 2. Update profile
      await tx.producerProfile.update({
        where: { id: verification.producerProfileId },
        data: { verificationStatus: 'REJECTED' }
      })

      return updatedVer
    })

    // STEP 6: Automatic Blockchain Anchoring
    const payload = HashingService.getProducerVerificationPayload(result)
    BlockchainService.anchorRecord('PRODUCER_VERIFICATION', result.id, 1, payload, req.user!.role as Role).catch(err => {
      console.error('Failed to trigger async blockchain anchor for PV:', err)
    })

    sendSuccess(res, 'Producer verification rejected.', { verification: result })
  } catch (error) {
    console.error('Reject verification error:', error)
    sendError(res, 'Internal server error.', 500)
  }
}
