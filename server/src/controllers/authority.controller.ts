import { Response } from 'express'
import { prisma } from '../lib/prisma'
import { sendSuccess, sendError } from '../lib/response'
import { AuthenticatedRequest } from '../middleware/auth.middleware'

export async function getAuthorityDashboard(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const authorityId = req.user!.id

    // Dashboard aggregation
    const pendingProducerVerifications = await prisma.producerVerification.count({
      where: { authorityId, status: { in: ['ASSIGNED', 'UNDER_REVIEW'] } }
    })

    const pendingLotInspections = await prisma.batchInspection.count({
      where: { authorityId, status: { in: ['PENDING', 'UNDER_INSPECTION'] } }
    })

    const approvedProducers = await prisma.producerVerification.count({
      where: { authorityId, decision: 'APPROVED' }
    })

    const rejectedProducers = await prisma.producerVerification.count({
      where: { authorityId, decision: 'REJECTED' }
    })
    
    // Inspections this month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)
    
    const inspectionsThisMonth = await prisma.batchInspection.count({
      where: { 
        authorityId, 
        createdAt: { gte: startOfMonth }
      }
    })

    sendSuccess(res, 'Dashboard data retrieved successfully.', {
      dashboard: {
        pendingProducerVerifications,
        pendingLotInspections,
        approvedProducers,
        rejectedProducers,
        inspectionsThisMonth,
      }
    })
  } catch (error) {
    console.error('Get authority dashboard error:', error)
    sendError(res, 'Internal server error.', 500)
  }
}
