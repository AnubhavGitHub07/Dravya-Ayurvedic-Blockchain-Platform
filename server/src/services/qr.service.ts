import * as crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { QRCode, QRCodeStatus } from '@prisma/client';
import { NotificationService } from './notification.service';
import { AuditService } from './audit.service';

export class QRService {
  /**
   * Generates a secure, random 8-character alphanumeric string.
   * e.g., DRV-7X92K4M8
   */
  private static generateSecureCode(): string {
    // We need 8 uppercase alphanumeric characters
    const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // removed confusing characters like I, 1, O, 0
    let code = '';
    while (code.length < 8) {
      const byte = crypto.randomBytes(1)[0];
      if (byte < charset.length) {
        code += charset[byte];
      }
    }
    return `DRV-${code}`;
  }

  /**
   * Generates a QR code for a batch if eligible.
   */
  public static async generateQRForBatch(batchId: string): Promise<{ code: string, verificationUrl: string }> {
    // 1. Check if Batch exists and fetch required related records
    const batch = await prisma.batch.findUnique({
      where: { id: batchId },
      include: {
        qrCode: true,
        producerProfile: {
          select: { verificationStatus: true, userId: true }
        },
        inspections: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        qualityTests: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!batch) {
      throw new Error('Batch not found');
    }

    // 2. Prevent multiple QR codes (1:1 constraint for this prototype)
    if (batch.qrCode) {
      throw new Error('A QR code already exists for this batch.');
    }

    // 3. Check Eligibility Requirements
    const isProducerApproved = batch.producerProfile?.verificationStatus === 'VERIFIED';
    const latestInspection = batch.inspections[0];
    const isInspectionApproved = latestInspection && latestInspection.status === 'APPROVED';
    const latestTest = batch.qualityTests[0];
    const isTestPassed = latestTest && latestTest.status === 'COMPLETED' && latestTest.overallResult === 'PASS';
    const isBatchQualityApproved = batch.status === 'QUALITY_APPROVED';

    if (!isProducerApproved || !isInspectionApproved || !isTestPassed || !isBatchQualityApproved) {
      throw new Error('Batch is not eligible for public QR generation. All verification and quality steps must be successfully completed.');
    }

    // 4. Generate unique secure code
    let secureCode = this.generateSecureCode();
    // Ensure absolute uniqueness in DB
    let isUnique = false;
    while (!isUnique) {
      const existing = await prisma.qRCode.findUnique({ where: { code: secureCode } });
      if (!existing) {
        isUnique = true;
      } else {
        secureCode = this.generateSecureCode();
      }
    }

    // 5. Create QR record
    const qrRecord = await prisma.qRCode.create({
      data: {
        batchId,
        code: secureCode,
        status: QRCodeStatus.ACTIVE
      }
    });

    NotificationService.createNotification({
      userId: batch.producerProfile.userId,
      type: 'QR_GENERATED',
      title: 'QR Code Generated',
      message: `A public verification QR code has been generated for batch ${batch.batchNumber}.`,
      entityType: 'QR_CODE',
      entityId: qrRecord.id,
      eventKey: `QR_GENERATED:${qrRecord.id}`,
      priority: 'NORMAL'
    });

    await AuditService.recordStateChange({
      action: 'QR_GENERATED',
      actorId: batch.producerProfile.userId, // We can assume producer is the logical actor, or system
      entityType: 'QRCode',
      entityId: qrRecord.id,
      newState: { status: qrRecord.status },
    });

    const baseUrl = process.env.PUBLIC_VERIFICATION_BASE_URL || 'http://localhost:3000';
    return {
      code: secureCode,
      verificationUrl: `${baseUrl}/verify/${secureCode}`
    };
  }

  /**
   * Revoke an active QR code
   */
  public static async revokeQR(qrId: string, adminId: string): Promise<QRCode> {
    const qr = await prisma.qRCode.findUnique({ 
      where: { id: qrId },
      include: { batch: { include: { producerProfile: { select: { userId: true } } } } }
    });
    if (!qr) {
      throw new Error('QR Code not found');
    }

    if (qr.status === QRCodeStatus.REVOKED) {
      throw new Error('QR Code is already revoked');
    }

    const updated = await prisma.qRCode.update({
      where: { id: qrId },
      data: {
        status: QRCodeStatus.REVOKED,
        revokedAt: new Date(),
        revokedBy: adminId
      }
    });

    NotificationService.createNotification({
      userId: qr.batch.producerProfile.userId,
      type: 'QR_REVOKED',
      title: 'QR Code Revoked',
      message: `The public verification QR code for batch ${qr.batch.batchNumber} has been revoked.`,
      entityType: 'QR_CODE',
      entityId: qr.id,
      eventKey: `QR_REVOKED:${qr.id}`,
      priority: 'HIGH'
    });

    await AuditService.recordStateChange({
      action: 'QR_REVOKED',
      actorId: adminId,
      entityType: 'QRCode',
      entityId: qr.id,
      newState: { status: updated.status },
    });

    return updated;
  }
}
