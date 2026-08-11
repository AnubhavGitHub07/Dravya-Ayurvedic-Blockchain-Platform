import crypto from 'crypto';
import stringify from 'fast-json-stable-stringify';

export class HashingService {
  /**
   * Normalize an object for deterministic hashing.
   * Handles dates, numbers, and nulls.
   */
  private static normalizeValue(value: any): any {
    if (value === null || value === undefined) {
      return null;
    }
    
    if (value instanceof Date) {
      return value.toISOString();
    }
    
    if (typeof value === 'number') {
      // Normalize number (e.g. handling -0 or precision)
      return Number(value.toPrecision(15));
    }
    
    if (Array.isArray(value)) {
      return value.map(this.normalizeValue.bind(this));
    }
    
    if (typeof value === 'object') {
      const normalizedObj: any = {};
      for (const key of Object.keys(value)) {
        normalizedObj[key] = this.normalizeValue(value[key]);
      }
      return normalizedObj;
    }
    
    return value;
  }

  /**
   * Generates a canonical representation of a record.
   */
  public static canonicalizeRecord(record: any): string {
    const normalized = this.normalizeValue(record);
    // fast-json-stable-stringify guarantees deterministic key ordering
    return stringify(normalized);
  }

  /**
   * Calculates a SHA-256 hash from a canonical string.
   */
  public static calculateHash(canonicalString: string): string {
    return crypto.createHash('sha256').update(canonicalString, 'utf8').digest('hex');
  }

  /**
   * Helper to canonicalize and hash in one step.
   */
  public static hashRecord(record: any): string {
    const canonical = this.canonicalizeRecord(record);
    return this.calculateHash(canonical);
  }

  // --- Entity-Specific Selectors ---
  // We only hash the relevant business data, excluding transient fields like updatedAt

  public static getProducerVerificationPayload(pv: any) {
    return {
      id: pv.id,
      producerProfileId: pv.producerProfileId,
      authorityId: pv.authorityId,
      status: pv.status,
      decision: pv.decision,
      verificationType: pv.verificationType,
      identityVerified: pv.identityVerified,
      documentsVerified: pv.documentsVerified,
      landVerified: pv.landVerified,
      locationVerified: pv.locationVerified,
      cultivationVerified: pv.cultivationVerified,
      inspectionDate: pv.inspectionDate,
      latitude: pv.latitude,
      longitude: pv.longitude,
      observations: pv.observations,
      rejectionReason: pv.rejectionReason,
    };
  }

  public static getBatchInspectionPayload(bi: any) {
    return {
      id: bi.id,
      batchId: bi.batchId,
      authorityId: bi.authorityId,
      status: bi.status,
      decision: bi.decision,
      declaredQuantity: bi.declaredQuantity,
      inspectedQuantity: bi.inspectedQuantity,
      herbIdentityVerified: bi.herbIdentityVerified,
      physicalQualityStatus: bi.physicalQualityStatus,
      packagingStatus: bi.packagingStatus,
      documentsVerified: bi.documentsVerified,
      inspectionDate: bi.inspectionDate,
      latitude: bi.latitude,
      longitude: bi.longitude,
      observations: bi.observations,
      rejectionReason: bi.rejectionReason,
    };
  }

  public static getQualityTestPayload(qt: any) {
    return {
      id: qt.id,
      batchId: qt.batchId,
      labId: qt.labId,
      sampleId: qt.sampleId,
      status: qt.status,
      overallResult: qt.overallResult,
      testingStartedAt: qt.testingStartedAt,
      testingCompletedAt: qt.testingCompletedAt,
      remarks: qt.remarks,
      // Results should ideally be included, but for simplicity we hash the main entity.
      // In a full system, you would join and hash the results array as well.
    };
  }

  public static getLabReportPayload(lr: any) {
    return {
      id: lr.id,
      qualityTestId: lr.qualityTestId,
      reportNumber: lr.reportNumber,
      // We only store the hash of the file if needed, but here we hash the URL/metadata
      reportUrl: lr.reportUrl, 
      reportFileName: lr.reportFileName,
      status: lr.status,
      generatedBy: lr.generatedBy,
      generatedAt: lr.generatedAt,
      finalizedAt: lr.finalizedAt,
    };
  }

  public static getSupplyChainEventPayload(sce: any) {
    return {
      id: sce.id,
      batchId: sce.batchId,
      actorId: sce.actorId,
      action: sce.action,
      location: sce.location,
      notes: sce.notes,
      quantity: sce.quantity,
      unit: sce.unit,
      latitude: sce.latitude,
      longitude: sce.longitude,
      referenceNumber: sce.referenceNumber,
      timestamp: sce.timestamp,
    };
  }
}
