import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { BlockchainService } from '../services/blockchain.service';
import { HashingService } from '../services/hashing.service';
import { sendResponse } from '../lib/response';

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
          const pv = await prisma.producerVerification.findUnique({ where: { id: entityId } });
          if (!pv) {
            sendResponse(res, 404, false, 'ProducerVerification not found');
            return;
          }
          if (pv.status !== 'COMPLETED' && pv.status !== 'VERIFIED' && pv.decision === null) {
            sendResponse(res, 400, false, 'Record is not finalized');
            return;
          }
          payload = HashingService.getProducerVerificationPayload(pv);
          // E.g., version logic could be based on updatedAt or simple increment. We use 1 for prototype.
          break;
        case 'BATCH_INSPECTION':
          const bi = await prisma.batchInspection.findUnique({ where: { id: entityId } });
          if (!bi) {
            sendResponse(res, 404, false, 'BatchInspection not found');
            return;
          }
          if (bi.status !== 'APPROVED' && bi.status !== 'REJECTED') {
            sendResponse(res, 400, false, 'Record is not finalized');
            return;
          }
          payload = HashingService.getBatchInspectionPayload(bi);
          break;
        case 'QUALITY_TEST':
          const qt = await prisma.qualityTest.findUnique({ where: { id: entityId } });
          if (!qt) {
            sendResponse(res, 404, false, 'QualityTest not found');
            return;
          }
          if (qt.status !== 'COMPLETED') {
            sendResponse(res, 400, false, 'Record is not finalized');
            return;
          }
          payload = HashingService.getQualityTestPayload(qt);
          break;
        case 'LAB_REPORT':
          const lr = await prisma.labReport.findUnique({ where: { id: entityId } });
          if (!lr) {
            sendResponse(res, 404, false, 'LabReport not found');
            return;
          }
          if (lr.status !== 'FINALIZED') {
            sendResponse(res, 400, false, 'Record is not finalized');
            return;
          }
          payload = HashingService.getLabReportPayload(lr);
          break;
        default:
          sendResponse(res, 400, false, 'Unsupported entity type');
          return;
      }

      // Do not block the request
      BlockchainService.anchorRecord(entityType, entityId, recordVersion, payload, user.role).catch(err => {
        console.error('Async anchor failed:', err);
      });

      sendResponse(res, 202, true, 'Anchoring process started');
    } catch (error: any) {
      sendResponse(res, 500, false, error.message || 'Failed to anchor record');
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
          const pv = await prisma.producerVerification.findUnique({ where: { id: entityId } });
          if (!pv) { sendResponse(res, 404, false, 'Record not found'); return; }
          payload = HashingService.getProducerVerificationPayload(pv);
          break;
        case 'BATCH_INSPECTION':
          const bi = await prisma.batchInspection.findUnique({ where: { id: entityId } });
          if (!bi) { sendResponse(res, 404, false, 'Record not found'); return; }
          payload = HashingService.getBatchInspectionPayload(bi);
          break;
        case 'QUALITY_TEST':
          const qt = await prisma.qualityTest.findUnique({ where: { id: entityId } });
          if (!qt) { sendResponse(res, 404, false, 'Record not found'); return; }
          payload = HashingService.getQualityTestPayload(qt);
          break;
        case 'LAB_REPORT':
          const lr = await prisma.labReport.findUnique({ where: { id: entityId } });
          if (!lr) { sendResponse(res, 404, false, 'Record not found'); return; }
          payload = HashingService.getLabReportPayload(lr);
          break;
        default:
          sendResponse(res, 400, false, 'Unsupported entity type');
          return;
      }

      const result = await BlockchainService.verifyRecord(entityType, entityId, recordVersion, payload, user.role);

      sendResponse(res, 200, result.verified, result.message, result.data);
    } catch (error: any) {
      sendResponse(res, 500, false, error.message || 'Verification failed');
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
        where: { entityType, entityId },
        orderBy: { recordVersion: 'asc' },
      });
      sendResponse(res, 200, true, 'History fetched', records);
    } catch (error: any) {
      sendResponse(res, 500, false, error.message || 'Failed to fetch history');
    }
  }
}
