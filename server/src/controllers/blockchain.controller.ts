import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { BlockchainService } from '../services/blockchain.service';
import { HashingService } from '../services/hashing.service';
import { sendSuccess, sendError } from '../lib/response';

export class BlockchainController {
  
  /**
   * Retry an anchor manually (must be ADMIN or authorized authority).
   * POST /api/blockchain/anchor/:entityType/:entityId
   */
  public async anchorRecord(req: Request, res: Response): Promise<void> {
    try {
      const { entityType, entityId } = req.params;
      const user = (req as any).user;
      
      let payload: any;
      let recordVersion = 1;

      // Ensure entity exists and is finalized
      switch (entityType) {
        case 'PRODUCER_VERIFICATION':
          const pv = await prisma.producerVerification.findUnique({ where: { id: entityId as string } });
          if (!pv) {
            sendError(res, 'ProducerVerification not found', 404);
            return;
          }
          if (pv.status !== 'COMPLETED' && pv.decision === null) {
            sendError(res, 'Record is not finalized', 400);
            return;
          }
          payload = HashingService.getProducerVerificationPayload(pv);
          // E.g., version logic could be based on updatedAt or simple increment. We use 1 for prototype.
          break;
        case 'BATCH_INSPECTION':
          const bi = await prisma.batchInspection.findUnique({ where: { id: entityId as string } });
          if (!bi) {
            sendError(res, 'BatchInspection not found', 404);
            return;
          }
          if (bi.status !== 'APPROVED' && bi.status !== 'REJECTED') {
            sendError(res, 'Record is not finalized', 400);
            return;
          }
          payload = HashingService.getBatchInspectionPayload(bi);
          break;
        case 'QUALITY_TEST':
          const qt = await prisma.qualityTest.findUnique({ where: { id: entityId as string } });
          if (!qt) {
            sendError(res, 'QualityTest not found', 404);
            return;
          }
          if (qt.status !== 'COMPLETED') {
            sendError(res, 'Record is not finalized', 400);
            return;
          }
          payload = HashingService.getQualityTestPayload(qt);
          break;
        case 'LAB_REPORT':
          const lr = await prisma.labReport.findUnique({ where: { id: entityId as string } });
          if (!lr) {
            sendError(res, 'LabReport not found', 404);
            return;
          }
          if (lr.status !== 'FINALIZED') {
            sendError(res, 'Record is not finalized', 400);
            return;
          }
          payload = HashingService.getLabReportPayload(lr);
          break;
        default:
          sendError(res, 'Unsupported entity type', 400);
          return;
      }

      // Do not block the request
      BlockchainService.anchorRecord(entityType as string, entityId as string, recordVersion, payload, user.role).catch(err => {
        console.error('Async anchor failed:', err);
      });

      sendSuccess(res, 'Anchoring process started', undefined, 202);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to anchor record', 500);
    }
  }

  /**
   * Verify a record against the blockchain
   * GET /api/blockchain/verify/:entityType/:entityId
   */
  public async verifyRecord(req: Request, res: Response): Promise<void> {
    try {
      const { entityType, entityId } = req.params;
      const user = (req as any).user;
      
      let payload: any;
      let recordVersion = 1;

      switch (entityType) {
        case 'PRODUCER_VERIFICATION':
          const pv = await prisma.producerVerification.findUnique({ where: { id: entityId as string } });
          if (!pv) { sendError(res, 'Record not found', 404); return; }
          payload = HashingService.getProducerVerificationPayload(pv);
          break;
        case 'BATCH_INSPECTION':
          const bi = await prisma.batchInspection.findUnique({ where: { id: entityId as string } });
          if (!bi) { sendError(res, 'Record not found', 404); return; }
          payload = HashingService.getBatchInspectionPayload(bi);
          break;
        case 'QUALITY_TEST':
          const qt = await prisma.qualityTest.findUnique({ where: { id: entityId as string } });
          if (!qt) { sendError(res, 'Record not found', 404); return; }
          payload = HashingService.getQualityTestPayload(qt);
          break;
        case 'LAB_REPORT':
          const lr = await prisma.labReport.findUnique({ where: { id: entityId as string } });
          if (!lr) { sendError(res, 'Record not found', 404); return; }
          payload = HashingService.getLabReportPayload(lr);
          break;
        default:
          sendError(res, 'Unsupported entity type', 400);
          return;
      }

      const result = await BlockchainService.verifyRecord(entityType as string, entityId as string, recordVersion, payload, user.role);

      if (result.verified) {
        sendSuccess(res, result.message, result.data, 200);
      } else {
        sendError(res, result.message, 400);
      }
    } catch (error: any) {
      sendError(res, error.message || 'Verification failed', 500);
    }
  }

  /**
   * Get history of an entity
   * GET /api/blockchain/history/:entityType/:entityId
   */
  public async getHistory(req: Request, res: Response): Promise<void> {
    try {
      const { entityType, entityId } = req.params;
      // In a real implementation, we would query Fabric for history.
      // For this prototype, returning the Prisma BlockchainRecords history is adequate
      const records = await prisma.blockchainRecord.findMany({
        where: { entityType: entityType as string, entityId: entityId as string },
        orderBy: { recordVersion: 'asc' },
      });
      sendSuccess(res, 'History fetched', { records }, 200);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to fetch history', 500);
    }
  }
}
