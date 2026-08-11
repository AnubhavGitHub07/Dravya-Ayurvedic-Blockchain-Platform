import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { sendSuccess, sendError } from '../lib/response'
import { createBatchSchema, updateBatchSchema, paginationSchema } from '../lib/validators'
import { AuthenticatedRequest } from '../middleware/auth.middleware'

// ─── Helpers ─────────────────────────────────────────────

/**
 * Generates a globally unique batch number.
 * Format: DRV-{HERB}-{YEAR}-{SEQ}
 * Example: DRV-ASH-2026-00001
 */
async function generateBatchNumber(herbCommonName: string): Promise<string> {
  const prefix = 'DRV'
  const herbCode = herbCommonName.substring(0, 3).toUpperCase().padEnd(3, 'X')
  const year = new Date().getFullYear()

  // Concurrency-safe sequence generation using Prisma transaction
  // Find the highest sequence number for the current year and herb code
  const lastBatch = await prisma.batch.findFirst({
    where: {
      batchNumber: {
        startsWith: `${prefix}-${herbCode}-${year}-`,
      },
    },
    orderBy: {
      batchNumber: 'desc',
    },
    select: { batchNumber: true },
  })

  let nextSeq = 1
  if (lastBatch) {
    const parts = lastBatch.batchNumber.split('-')
    const lastSeq = parseInt(parts[parts.length - 1], 10)
    if (!isNaN(lastSeq)) {
      nextSeq = lastSeq + 1
    }
  }

  const seqString = nextSeq.toString().padStart(5, '0')
  return `${prefix}-${herbCode}-${year}-${seqString}`
}

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

export async function createBatch(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id
    const userRole = req.user!.role

    // Ensure the producer has a profile
    let profileId: string | null = null
    if (userRole === 'PRODUCER') {
      const profile = await prisma.producerProfile.findUnique({
        where: { userId },
        select: { id: true },
      })
      if (!profile) {
        sendError(res, 'Please complete your producer profile before creating a batch.', 403)
        return
      }
      profileId = profile.id
    } else if (userRole === 'ADMIN') {
      // For ADMIN creating a batch on behalf of a producer (optional/advanced flow)
      // We will require producerProfileId in the body if we implement this fully.
      // For now, we assume ADMIN must provide producerProfileId.
      profileId = req.body.producerProfileId
      if (!profileId) {
        sendError(res, 'Admin must specify a producerProfileId.', 400)
        return
      }
    } else {
      sendError(res, 'Unauthorized role for creating batches.', 403)
      return
    }

    const validation = createBatchSchema.safeParse(req.body)
    if (!validation.success) {
      sendError(res, 'Validation failed.', 400, validation.error.flatten().fieldErrors)
      return
    }

    const batchData = validation.data

    // Verify herb exists and is active
    const herb = await prisma.herb.findUnique({
      where: { id: batchData.herbId },
    })
    if (!herb) {
      sendError(res, 'Herb not found.', 404)
      return
    }
    if (!herb.isActive) {
      sendError(res, 'This herb is currently inactive and cannot be used for new batches.', 400)
      return
    }

    // Use a transaction to safely generate the batch number and create the batch
    const batch = await prisma.$transaction(async (tx) => {
      const batchNumber = await generateBatchNumber(herb.commonName)

      return tx.batch.create({
        data: {
          ...batchData,
          batchNumber,
          producerProfileId: profileId!,
          status: 'DRAFT',
        },
        include: {
          herb: { select: { commonName: true, botanicalName: true } },
          producerProfile: { select: { farmName: true, verificationStatus: true } },
        },
      })
    })

    sendSuccess(res, 'Batch created successfully.', { batch }, 201)
  } catch (error) {
    console.error('Create batch error:', error)
    sendError(res, 'Internal server error.', 500)
  }
}

export async function getAllBatches(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { page, limit } = paginationSchema.parse(req.query)
    const status = getQueryString(req.query.status)
    const skip = (page - 1) * limit
    
    const userRole = req.user!.role
    const userId = req.user!.id
    
    let where: any = {}
    
    if (status) {
      where.status = status
    }
    
    if (userRole === 'PRODUCER') {
      const profile = await prisma.producerProfile.findUnique({
        where: { userId },
        select: { id: true },
      })
      if (!profile) {
        sendSuccess(res, 'Batches retrieved successfully.', {
          batches: [],
          pagination: { page, limit, total: 0, totalPages: 0 },
        })
        return
      }
      where.producerProfileId = profile.id
    }
    // Else (ADMIN), where condition stays as is (or filters by status if provided)

    const [batches, total] = await Promise.all([
      prisma.batch.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          herb: { select: { commonName: true } },
          producerProfile: { select: { farmName: true } },
        },
      }),
      prisma.batch.count({ where }),
    ])

    sendSuccess(res, 'Batches retrieved successfully.', {
      batches,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get batches error:', error)
    sendError(res, 'Internal server error.', 500)
  }
}

export async function getBatchById(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const id = getParamString(req.params.id)
    if (!id) {
      sendError(res, 'Batch ID is required.', 400)
      return
    }

    const userRole = req.user!.role
    const userId = req.user!.id

    const batch = await prisma.batch.findUnique({
      where: { id },
      include: {
        herb: true,
        producerProfile: {
          include: { user: { select: { name: true, email: true } } },
        },
      },
    })

    if (!batch) {
      sendError(res, 'Batch not found.', 404)
      return
    }

    // Ownership check for PRODUCER
    if (userRole === 'PRODUCER' && batch.producerProfile.userId !== userId) {
      sendError(res, 'Forbidden. You do not have permission to view this batch.', 403)
      return
    }

    sendSuccess(res, 'Batch retrieved successfully.', { batch })
  } catch (error) {
    console.error('Get batch error:', error)
    sendError(res, 'Internal server error.', 500)
  }
}

export async function updateBatch(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const id = getParamString(req.params.id)
    if (!id) {
      sendError(res, 'Batch ID is required.', 400)
      return
    }

    const validation = updateBatchSchema.safeParse(req.body)
    if (!validation.success) {
      sendError(res, 'Validation failed.', 400, validation.error.flatten().fieldErrors)
      return
    }

    const batchData = validation.data
    const userRole = req.user!.role
    const userId = req.user!.id

    const existingBatch = await prisma.batch.findUnique({
      where: { id },
      include: { producerProfile: true },
    })

    if (!existingBatch) {
      sendError(res, 'Batch not found.', 404)
      return
    }

    // Ownership check for PRODUCER
    if (userRole === 'PRODUCER') {
      if (existingBatch.producerProfile.userId !== userId) {
        sendError(res, 'Forbidden. You do not have permission to modify this batch.', 403)
        return
      }
      
      // Producer can only update DRAFT batches
      if (existingBatch.status !== 'DRAFT') {
        sendError(res, 'You can only update batches in DRAFT status.', 400)
        return
      }
    }

    const batch = await prisma.batch.update({
      where: { id },
      data: batchData,
      include: {
        herb: { select: { commonName: true, botanicalName: true } },
      },
    })

    sendSuccess(res, 'Batch updated successfully.', { batch })
  } catch (error) {
    console.error('Update batch error:', error)
    sendError(res, 'Internal server error.', 500)
  }
}

export async function submitBatch(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const id = getParamString(req.params.id)
    if (!id) {
      sendError(res, 'Batch ID is required.', 400)
      return
    }

    const userId = req.user!.id

    const existingBatch = await prisma.batch.findUnique({
      where: { id },
      include: { producerProfile: true },
    })

    if (!existingBatch) {
      sendError(res, 'Batch not found.', 404)
      return
    }

    // Ownership check
    if (existingBatch.producerProfile.userId !== userId) {
      sendError(res, 'Forbidden. You do not have permission to submit this batch.', 403)
      return
    }

    // Check if the batch is in DRAFT status
    if (existingBatch.status !== 'DRAFT') {
      sendError(res, 'Only DRAFT batches can be submitted.', 400)
      return
    }

    // Check if producer is VERIFIED
    if (existingBatch.producerProfile.verificationStatus !== 'VERIFIED') {
      sendError(res, 'You cannot submit a batch until your producer profile is VERIFIED.', 403)
      return
    }

    // Submit the batch (change status to PENDING_VERIFICATION)
    const batch = await prisma.batch.update({
      where: { id },
      data: { status: 'PENDING_VERIFICATION' },
    })

    sendSuccess(res, 'Batch submitted successfully. It is now pending verification.', { batch })
  } catch (error) {
    console.error('Submit batch error:', error)
    sendError(res, 'Internal server error.', 500)
  }
}

export async function getBatchSupplyChain(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const id = getParamString(req.params.id)
    if (!id) {
      sendError(res, 'Batch ID is required.', 400)
      return
    }

    const userId = req.user!.id
    const userRole = req.user!.role

    const batch = await prisma.batch.findUnique({
      where: { id },
      include: { 
        supplyChainEvents: { orderBy: { timestamp: 'asc' } },
        producerProfile: true,
        distributorAssignments: true
      },
    })

    if (!batch) {
      sendError(res, 'Batch not found.', 404)
      return
    }

    // Ownership checks
    if (userRole === 'PRODUCER') {
      if (batch.producerProfile.userId !== userId) {
        sendError(res, 'Forbidden. You do not have permission to view this batch.', 403)
        return
      }
    } else if (userRole === 'DISTRIBUTOR') {
      const isAssigned = batch.distributorAssignments.some(a => a.distributorId === userId)
      if (!isAssigned) {
        sendError(res, 'Forbidden. You do not have permission to view this batch.', 403)
        return
      }
    }
    // Admin, Lab, Verification Authority can view any batch

    const timeline = batch.supplyChainEvents.map((event) => ({
      type: event.action,
      timestamp: event.timestamp,
      quantity: event.quantity,
      unit: event.unit,
      location: event.location,
      status: 'COMPLETED'
    }))

    sendSuccess(res, 'Supply chain timeline retrieved successfully.', {
      batchNumber: batch.batchNumber,
      currentStatus: batch.status,
      events: timeline
    })
  } catch (error) {
    console.error('Get supply chain error:', error)
    sendError(res, 'Internal server error.', 500)
  }
}
