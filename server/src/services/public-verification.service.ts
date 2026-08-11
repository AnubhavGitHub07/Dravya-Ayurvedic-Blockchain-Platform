import { prisma } from '../lib/prisma';
import { QRCodeStatus, Role } from '@prisma/client';
import { BlockchainService } from './blockchain.service';
import { HashingService } from './hashing.service';

export class PublicVerificationService {
  /**
   * Verify a QR code and return a public-safe traceability timeline
   */
  public static async verifyQR(code: string): Promise<any> {
    // 1. Fetch QR
    const qr = await prisma.qRCode.findUnique({
      where: { code },
      include: {
        batch: {
          include: {
            herb: true,
            producerProfile: {
              include: { verifications: { orderBy: { createdAt: 'desc' }, take: 1 } }
            },
            inspections: { orderBy: { createdAt: 'desc' }, take: 1 },
            qualityTests: { 
              orderBy: { createdAt: 'desc' }, take: 1,
              include: { reports: { where: { status: 'FINALIZED' }, orderBy: { generatedAt: 'desc' }, take: 1 } }
            },
            supplyChainEvents: {
              orderBy: { timestamp: 'asc' }
            }
          }
        }
      }
    });

    if (!qr) {
      return { verified: false, status: 'INVALID_CODE', message: 'The provided verification code does not exist.' };
    }

    if (qr.status === QRCodeStatus.REVOKED) {
      return { verified: false, status: 'REVOKED', message: 'This verification code has been revoked.' };
    }

    const batch = qr.batch;

    // 2. Fetch required entities for hash checking
    const pv = batch.producerProfile.verifications[0];
    const bi = batch.inspections[0];
    const qt = batch.qualityTests[0];
    const lr = qt?.reports[0];

    // If any critical data is missing, it's incomplete
    if (!pv || !bi || !qt || !lr) {
      return { verified: false, status: 'VERIFICATION_INCOMPLETE', message: 'Traceability data is incomplete.' };
    }

    // 3. Verify Blockchain Hashes
    // Note: In this public service context, we perform the verification impersonating a read-only or generic system role.
    // For the prototype, we can use ADMIN role to safely query the Fabric Gateway.
    const systemRole = Role.ADMIN; 

    const pvVerify = await BlockchainService.verifyRecord('PRODUCER_VERIFICATION', pv.id, 1, HashingService.getProducerVerificationPayload(pv), systemRole);
    const biVerify = await BlockchainService.verifyRecord('BATCH_INSPECTION', bi.id, 1, HashingService.getBatchInspectionPayload(bi), systemRole);
    const qtVerify = await BlockchainService.verifyRecord('QUALITY_TEST', qt.id, 1, HashingService.getQualityTestPayload(qt), systemRole);
    const lrVerify = await BlockchainService.verifyRecord('LAB_REPORT', lr.id, 1, HashingService.getLabReportPayload(lr), systemRole);

    const allHashesValid = pvVerify.verified && biVerify.verified && qtVerify.verified && lrVerify.verified;

    if (!allHashesValid) {
      return { verified: false, status: 'BLOCKCHAIN_VERIFICATION_FAILED', message: 'Blockchain integrity check failed. The data may have been altered.' };
    }

    // 4. Construct Public-Safe Response
    const responseData = {
      verified: true,
      
      product: {
        herb: batch.herb.commonName,
        botanicalName: batch.herb.botanicalName,
        batchNumber: batch.batchNumber,
        harvestDate: batch.harvestDate.toISOString().split('T')[0],
        cultivationMethod: batch.cultivationMethod
      },

      producer: {
        name: batch.producerProfile.farmName,
        village: batch.producerProfile.village,
        district: batch.producerProfile.district,
        state: batch.producerProfile.state
      },

      governmentVerification: {
        status: pv.status === 'COMPLETED' && pv.decision === 'APPROVED' ? 'VERIFIED' : 'PENDING'
      },

      lotInspection: {
        status: bi.status === 'APPROVED' ? 'APPROVED' : 'PENDING',
        inspectionDate: bi.inspectionDate ? bi.inspectionDate.toISOString().split('T')[0] : null,
        inspectedQuantity: bi.inspectedQuantity
      },

      laboratory: {
        status: qt.overallResult === 'PASS' ? 'PASSED' : 'FAILED',
        reportNumber: lr.reportNumber,
        testingCompletedAt: qt.testingCompletedAt ? qt.testingCompletedAt.toISOString().split('T')[0] : null
      },

      blockchain: {
        status: 'CONFIRMED',
        integrityVerified: true,
        // Exposing safe technical details
        details: {
          producerVerificationTx: pvVerify.data?.transactionId,
          batchInspectionTx: biVerify.data?.transactionId,
          qualityTestTx: qtVerify.data?.transactionId,
          labReportTx: lrVerify.data?.transactionId,
          network: pvVerify.data?.network || 'local-test-network'
        }
      },

      timeline: [
        {
          type: 'CULTIVATION',
          label: 'Herb Cultivated & Harvested',
          date: batch.harvestDate.toISOString().split('T')[0],
          status: 'COMPLETED'
        },
        {
          type: 'PRODUCER_VERIFICATION',
          label: 'Producer Verification Completed',
          date: pv.updatedAt.toISOString().split('T')[0],
          status: pv.decision === 'APPROVED' ? 'VERIFIED' : 'REJECTED'
        },
        {
          type: 'LOT_INSPECTION',
          label: 'Government Lot Inspected',
          date: bi.inspectionDate ? bi.inspectionDate.toISOString().split('T')[0] : bi.updatedAt.toISOString().split('T')[0],
          status: bi.decision === 'APPROVED' ? 'APPROVED' : 'REJECTED'
        },
        {
          type: 'LAB_TEST',
          label: 'Laboratory Tested',
          date: qt.testingCompletedAt ? qt.testingCompletedAt.toISOString().split('T')[0] : qt.updatedAt.toISOString().split('T')[0],
          status: qt.overallResult === 'PASS' ? 'PASSED' : 'FAILED'
        },
        {
          type: 'BLOCKCHAIN',
          label: 'Blockchain Integrity Verified',
          date: new Date().toISOString().split('T')[0], // Current time of verification check
          status: 'VERIFIED'
        }
      ],
      supplyChain: {
        currentStatus: batch.status,
        events: batch.supplyChainEvents.map(event => ({
          type: event.action,
          date: event.timestamp.toISOString().split('T')[0],
          status: 'COMPLETED'
        }))
      }
    };

    return { success: true, data: responseData };
  }
}
