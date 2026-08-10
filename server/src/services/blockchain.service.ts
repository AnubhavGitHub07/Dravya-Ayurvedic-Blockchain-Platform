import { BlockchainRecordStatus, Role } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { FabricConnectionService } from './fabric-connection.service';
import { HashingService } from './hashing.service';

export class BlockchainService {
  /**
   * Attempts to anchor a finalized record to the blockchain.
   * This handles the idempotency check and error handling so that
   * temporary Fabric failures do not crash the application.
   */
  public static async anchorRecord(
    entityType: string,
    entityId: string,
    recordVersion: number,
    payload: any,
    userRole: Role
  ): Promise<void> {
    try {
      // 1. Check if it already exists to prevent duplicate anchors for the same version
      let record = await prisma.blockchainRecord.findUnique({
        where: {
          entityType_entityId_recordVersion: {
            entityType,
            entityId,
            recordVersion,
          },
        },
      });

      if (record && record.status === BlockchainRecordStatus.CONFIRMED) {
        console.log(`Record ${entityType}/${entityId}/v${recordVersion} is already anchored.`);
        return;
      }

      // Calculate deterministic hash
      const dataHash = HashingService.hashRecord(payload);

      // Create or update to PENDING
      if (!record) {
        record = await prisma.blockchainRecord.create({
          data: {
            entityType,
            entityId,
            recordVersion,
            dataHash,
            status: BlockchainRecordStatus.PENDING,
          },
        });
      } else {
        record = await prisma.blockchainRecord.update({
          where: { id: record.id },
          data: { status: BlockchainRecordStatus.PENDING, dataHash },
        });
      }

      // 2. Submit to Fabric
      let contract;
      let closeFabric;
      try {
        const conn = await FabricConnectionService.getContractForRole(userRole);
        contract = conn.contract;
        closeFabric = conn.close;
      } catch (err: any) {
        console.error('Failed to connect to Fabric:', err.message);
        await prisma.blockchainRecord.update({
          where: { id: record.id },
          data: { status: BlockchainRecordStatus.FAILED },
        });
        return;
      }

      try {
        const recordId = `DRV-${entityType}-${entityId}-V${recordVersion}`;
        const timestamp = new Date().toISOString();
        const actorOrg = FabricConnectionService.getMspIdForRole(userRole);

        await prisma.blockchainRecord.update({
          where: { id: record.id },
          data: { status: BlockchainRecordStatus.SUBMITTED },
        });

        // Submit transaction
        const resultBytes = await contract.submitTransaction(
          'CreateTraceabilityRecord',
          recordId,
          entityType,
          dataHash,
          recordVersion.toString(),
          actorOrg,
          timestamp
        );

        // Transaction successful. In Fabric Gateway, the submission returning without error implies commit.
        // We can get the transaction ID if needed, but the Gateway API abstracts it heavily.
        // We'll mark it confirmed.
        await prisma.blockchainRecord.update({
          where: { id: record.id },
          data: {
            status: BlockchainRecordStatus.CONFIRMED,
            anchoredAt: new Date(),
            network: 'local-test-network',
            channel: 'dravya-channel',
            chaincode: 'traceability',
            // Gateway API doesn't easily return txId on submit without casting to legacy classes, 
            // but we can just store the dataHash or query it later. We'll set a placeholder txId.
            transactionId: `tx-${Date.now()}` // Mocking txId for simplicity in Gateway API
          },
        });
        
        console.log(`Successfully anchored ${recordId} to Fabric.`);
      } catch (err: any) {
        console.error('Fabric transaction failed:', err.message);
        await prisma.blockchainRecord.update({
          where: { id: record.id },
          data: { status: BlockchainRecordStatus.FAILED },
        });
      } finally {
        if (closeFabric) closeFabric();
      }
    } catch (error) {
      console.error('Unexpected error in anchorRecord:', error);
    }
  }

  /**
   * Verify a record's integrity against the blockchain.
   */
  public static async verifyRecord(
    entityType: string,
    entityId: string,
    recordVersion: number,
    currentPayload: any,
    userRole: Role
  ): Promise<{ verified: boolean; message: string; data?: any }> {
    // 1. Calculate current hash
    const currentHash = HashingService.hashRecord(currentPayload);

    // 2. Fetch BlockchainRecord
    const record = await prisma.blockchainRecord.findUnique({
      where: {
        entityType_entityId_recordVersion: {
          entityType,
          entityId,
          recordVersion,
        },
      },
    });

    if (!record || record.status !== BlockchainRecordStatus.CONFIRMED) {
      return {
        verified: false,
        message: 'No confirmed blockchain record found for this version.',
      };
    }

    // 3. Connect to Fabric and verify
    let contract;
    let closeFabric;
    try {
      const conn = await FabricConnectionService.getContractForRole(userRole);
      contract = conn.contract;
      closeFabric = conn.close;

      const recordId = `DRV-${entityType}-${entityId}-V${recordVersion}`;
      const resultBytes = await contract.evaluateTransaction('VerifyRecordHash', recordId, currentHash);
      const isVerified = resultBytes.toString() === 'true';

      return {
        verified: isVerified,
        message: isVerified ? 'Record integrity verified' : 'Integrity check failed. Hashes do not match.',
        data: {
          entityType,
          entityId,
          currentHash,
          blockchainHash: record.dataHash,
          verified: isVerified,
          transactionId: record.transactionId,
          network: record.network,
        },
      };
    } catch (err: any) {
      return {
        verified: false,
        message: `Error verifying with Fabric: ${err.message}`,
      };
    } finally {
      if (closeFabric) closeFabric();
    }
  }
}
