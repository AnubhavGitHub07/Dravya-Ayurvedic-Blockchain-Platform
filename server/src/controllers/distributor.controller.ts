import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { SupplyChainService } from '../services/supply-chain.service';
import { sendSuccess, sendError } from '../lib/response';
import { distributorActionSchema } from '../lib/validators';
import { prisma } from '../lib/prisma';
import { AssignmentStatus, BatchStatus } from '@prisma/client';

export class DistributorController {
  
  public async getDashboard(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const distributorId = req.user!.id;
      
      const assignments = await prisma.distributorAssignment.findMany({
        where: { distributorId },
        include: { batch: true }
      });
      
      const assigned = assignments.length;
      const awaitingAcceptance = assignments.filter(a => a.status === AssignmentStatus.ASSIGNED).length;
      const accepted = assignments.filter(a => a.status === AssignmentStatus.ACCEPTED && a.batch.status === BatchStatus.QUALITY_APPROVED).length;
      const inTransit = assignments.filter(a => a.batch.status === BatchStatus.IN_TRANSIT).length;
      const delivered = assignments.filter(a => a.batch.status === BatchStatus.DELIVERED).length;

      sendSuccess(res, 'Distributor dashboard retrieved', {
        assigned,
        awaitingAcceptance,
        accepted,
        inTransit,
        delivered
      });
    } catch (error: any) {
      console.error('Distributor dashboard error:', error);
      sendError(res, 'Internal server error', 500);
    }
  }

  public async getAssignedBatches(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const distributorId = req.user!.id;
      
      const assignments = await prisma.distributorAssignment.findMany({
        where: { distributorId },
        include: { batch: { include: { herb: true } } }
      });

      sendSuccess(res, 'Assigned batches retrieved', { assignments });
    } catch (error: any) {
      console.error('Get assigned batches error:', error);
      sendError(res, 'Internal server error', 500);
    }
  }

  public async receiveBatch(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const distributorId = req.user!.id;
      const batchId = req.params.id;
      
      const parsed = distributorActionSchema.safeParse(req.body);
      if (!parsed.success) {
        sendError(res, parsed.error.errors[0].message, 400);
        return;
      }

      const event = await SupplyChainService.receiveBatch(batchId, distributorId, parsed.data);
      
      sendSuccess(res, 'Batch received successfully', { event }, 201);
    } catch (error: any) {
      console.error('Receive batch error:', error);
      sendError(res, error.message, 400);
    }
  }

  public async dispatchBatch(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const distributorId = req.user!.id;
      const batchId = req.params.id;
      
      const parsed = distributorActionSchema.safeParse(req.body);
      if (!parsed.success) {
        sendError(res, parsed.error.errors[0].message, 400);
        return;
      }

      const event = await SupplyChainService.dispatchBatch(batchId, distributorId, parsed.data);
      
      sendSuccess(res, 'Batch dispatched successfully', { event }, 201);
    } catch (error: any) {
      console.error('Dispatch batch error:', error);
      sendError(res, error.message, 400);
    }
  }

  public async deliverBatch(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const distributorId = req.user!.id;
      const batchId = req.params.id;
      
      const parsed = distributorActionSchema.safeParse(req.body);
      if (!parsed.success) {
        sendError(res, parsed.error.errors[0].message, 400);
        return;
      }

      const event = await SupplyChainService.deliverBatch(batchId, distributorId, parsed.data);
      
      sendSuccess(res, 'Batch delivered successfully', { event }, 201);
    } catch (error: any) {
      console.error('Deliver batch error:', error);
      sendError(res, error.message, 400);
    }
  }
}
