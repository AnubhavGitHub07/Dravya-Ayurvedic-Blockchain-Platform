import { prisma } from '../lib/prisma';
import { Role, BatchStatus, AssignmentStatus } from '@prisma/client';
import { BlockchainService } from './blockchain.service';
import { HashingService } from './hashing.service';
import { NotificationService } from './notification.service';
import { AuditService } from './audit.service';

export class SupplyChainService {
  /**
   * Assign a distributor to a batch (Admin only).
   */
  public static async assignDistributor(batchId: string, distributorId: string, adminId: string) {
    const batch = await prisma.batch.findUnique({
      where: { id: batchId },
      include: { distributorAssignments: { where: { status: 'ASSIGNED' } } }
    });

    if (!batch) throw new Error('Batch not found');
    if (batch.status !== BatchStatus.QUALITY_APPROVED) {
      throw new Error('Batch must be QUALITY_APPROVED to be assigned for distribution');
    }
    if (batch.distributorAssignments.length > 0) {
      throw new Error('Batch is already assigned to a distributor');
    }

    const distributor = await prisma.user.findUnique({ where: { id: distributorId } });
    if (!distributor || distributor.role !== Role.DISTRIBUTOR || !distributor.isActive) {
      throw new Error('Invalid or inactive distributor');
    }

    const assignment = await prisma.$transaction(async (tx) => {
      const newAssignment = await tx.distributorAssignment.create({
        data: {
          batchId,
          distributorId,
          assignedBy: adminId,
          status: AssignmentStatus.ASSIGNED
        }
      });
      return newAssignment;
    });

    NotificationService.createNotification({
      userId: distributorId,
      type: 'DISTRIBUTOR_ASSIGNED',
      title: 'New Batch Assigned',
      message: `Batch ${batch.batchNumber} has been assigned to you.`,
      entityType: 'DISTRIBUTOR_ASSIGNMENT',
      entityId: assignment.id,
      eventKey: `DISTRIBUTOR_ASSIGNED:${assignment.id}`,
      priority: 'NORMAL'
    });

    await AuditService.recordStateChange({
      action: 'DISTRIBUTOR_ASSIGNED',
      actorId: adminId,
      entityType: 'DistributorAssignment',
      entityId: assignment.id,
      newState: { status: assignment.status, distributorId },
    });

    return assignment;
  }

  /**
   * Distributor receives the batch.
   */
  public static async receiveBatch(batchId: string, distributorId: string, payload: any) {
    const batch = await prisma.batch.findUnique({
      where: { id: batchId },
      include: { 
        distributorAssignments: { where: { distributorId, status: 'ASSIGNED' } },
        producerProfile: { select: { userId: true } }
      }
    });

    if (!batch) throw new Error('Batch not found');
    if (batch.distributorAssignments.length === 0) {
      throw new Error('Batch is not assigned to you or assignment is not ACTIVE');
    }
    if (batch.status !== BatchStatus.QUALITY_APPROVED) {
      throw new Error('Batch is not in a valid state to be received');
    }

    const assignment = batch.distributorAssignments[0];

    const result = await prisma.$transaction(async (tx) => {
      await tx.distributorAssignment.update({
        where: { id: assignment.id },
        data: { status: AssignmentStatus.ACCEPTED, acceptedAt: new Date() }
      });

      await tx.batch.update({
        where: { id: batchId },
        data: { status: BatchStatus.QUALITY_APPROVED } // Using IN_TRANSIT next, we can use an intermediate if required, or keep it QUALITY_APPROVED until Dispatch. Wait, user said QUALITY_APPROVED -> ASSIGNED -> RECEIVED -> IN_TRANSIT. Since we didn't add RECEIVED_BY_DISTRIBUTOR to enum, I will use IN_TRANSIT on dispatch. For Receive, we can just leave it QUALITY_APPROVED or update assignment. Actually, let's just create the event.
      });
      // The state machine from prompt: QUALITY_APPROVED -> ASSIGNED -> RECEIVED -> IN_TRANSIT -> DELIVERED.
      // But BatchStatus only has IN_TRANSIT and DELIVERED. So QUALITY_APPROVED remains until IN_TRANSIT.

      const event = await tx.supplyChainEvent.create({
        data: {
          batchId,
          actorId: distributorId,
          action: 'BATCH_RECEIVED',
          quantity: payload.quantity,
          unit: payload.unit || 'KG',
          location: payload.location,
          latitude: payload.latitude,
          longitude: payload.longitude,
          notes: payload.notes
        }
      });

      return event;
    });

    // Blockchain anchor
    BlockchainService.anchorRecord(
      'SUPPLY_CHAIN_EVENT', 
      result.id, 
      1, 
      HashingService.getSupplyChainEventPayload(result), 
      Role.DISTRIBUTOR
    ).catch(err => console.error('Blockchain anchor failed for BATCH_RECEIVED:', err));

    NotificationService.createNotification({
      userId: batch.producerProfile.userId,
      type: 'BATCH_RECEIVED',
      title: 'Batch Received',
      message: `Batch ${batch.batchNumber} has been received by the distributor.`,
      entityType: 'SUPPLY_CHAIN_EVENT',
      entityId: result.id,
      eventKey: `BATCH_RECEIVED:${result.id}`,
      priority: 'NORMAL'
    });

    await AuditService.recordStateChange({
      action: 'BATCH_RECEIVED',
      actorId: distributorId,
      entityType: 'SupplyChainEvent',
      entityId: result.id,
      newState: { quantity: payload.quantity, location: payload.location },
    });

    return result;
  }

  /**
   * Distributor dispatches the batch.
   */
  public static async dispatchBatch(batchId: string, distributorId: string, payload: any) {
    const batch = await prisma.batch.findUnique({
      where: { id: batchId },
      include: {
        distributorAssignments: { where: { distributorId, status: 'ACCEPTED' } },
        supplyChainEvents: { where: { action: 'BATCH_RECEIVED' }, orderBy: { timestamp: 'desc' }, take: 1 },
        producerProfile: { select: { userId: true } }
      }
    });

    if (!batch) throw new Error('Batch not found');
    if (batch.distributorAssignments.length === 0) {
      throw new Error('Batch is not accepted by you');
    }
    
    // Check if received
    const receiveEvent = batch.supplyChainEvents[0];
    if (!receiveEvent) {
      throw new Error('Batch must be received before it can be dispatched');
    }

    // Check quantity bounds
    if (payload.quantity > receiveEvent.quantity!) {
      throw new Error('Dispatch quantity cannot exceed received quantity');
    }
    
    // Check if already dispatched
    const dispatchCheck = await prisma.supplyChainEvent.findFirst({
      where: { batchId, action: 'BATCH_DISPATCHED' }
    });
    if (dispatchCheck) {
      throw new Error('Batch is already dispatched');
    }

    const result = await prisma.$transaction(async (tx) => {
      await tx.batch.update({
        where: { id: batchId },
        data: { status: BatchStatus.IN_TRANSIT }
      });

      const event = await tx.supplyChainEvent.create({
        data: {
          batchId,
          actorId: distributorId,
          action: 'BATCH_DISPATCHED',
          quantity: payload.quantity,
          unit: payload.unit || 'KG',
          location: payload.destination, // Storing destination in location
          latitude: payload.latitude,
          longitude: payload.longitude,
          referenceNumber: payload.referenceNumber,
          notes: payload.notes
        }
      });

      return event;
    });

    // Blockchain anchor
    BlockchainService.anchorRecord(
      'SUPPLY_CHAIN_EVENT', 
      result.id, 
      1, 
      HashingService.getSupplyChainEventPayload(result), 
      Role.DISTRIBUTOR
    ).catch(err => console.error('Blockchain anchor failed for BATCH_DISPATCHED:', err));

    NotificationService.createNotification({
      userId: batch.producerProfile.userId,
      type: 'BATCH_DISPATCHED',
      title: 'Batch Dispatched',
      message: `Batch ${batch.batchNumber} has been dispatched.`,
      entityType: 'SUPPLY_CHAIN_EVENT',
      entityId: result.id,
      eventKey: `BATCH_DISPATCHED:${result.id}`,
      priority: 'NORMAL'
    });

    await AuditService.recordStateChange({
      action: 'BATCH_DISPATCHED',
      actorId: distributorId,
      entityType: 'SupplyChainEvent',
      entityId: result.id,
      newState: { quantity: payload.quantity, location: payload.destination },
    });

    return result;
  }

  /**
   * Confirm delivery.
   */
  public static async deliverBatch(batchId: string, distributorId: string, payload: any) {
    const batch = await prisma.batch.findUnique({
      where: { id: batchId },
      include: {
        distributorAssignments: { where: { distributorId, status: 'ACCEPTED' } },
        supplyChainEvents: { where: { action: 'BATCH_DISPATCHED' }, orderBy: { timestamp: 'desc' }, take: 1 },
        producerProfile: { select: { userId: true } }
      }
    });

    if (!batch) throw new Error('Batch not found');
    if (batch.distributorAssignments.length === 0) {
      throw new Error('Batch is not accepted by you');
    }
    
    // Check if dispatched
    const dispatchEvent = batch.supplyChainEvents[0];
    if (!dispatchEvent) {
      throw new Error('Batch must be dispatched before it can be delivered');
    }
    if (batch.status !== BatchStatus.IN_TRANSIT) {
      throw new Error('Batch must be IN_TRANSIT to be delivered');
    }

    // Check quantity bounds
    if (payload.quantity > dispatchEvent.quantity!) {
      throw new Error('Delivery quantity cannot exceed dispatched quantity');
    }
    
    // Check if already delivered
    const deliveryCheck = await prisma.supplyChainEvent.findFirst({
      where: { batchId, action: 'BATCH_DELIVERED' }
    });
    if (deliveryCheck) {
      throw new Error('Batch is already delivered');
    }

    const assignment = batch.distributorAssignments[0];

    const result = await prisma.$transaction(async (tx) => {
      await tx.batch.update({
        where: { id: batchId },
        data: { status: BatchStatus.DELIVERED }
      });
      
      await tx.distributorAssignment.update({
        where: { id: assignment.id },
        data: { status: AssignmentStatus.COMPLETED, completedAt: new Date() }
      });

      const event = await tx.supplyChainEvent.create({
        data: {
          batchId,
          actorId: distributorId,
          action: 'BATCH_DELIVERED',
          quantity: payload.quantity,
          unit: payload.unit || 'KG',
          location: payload.destination,
          latitude: payload.latitude,
          longitude: payload.longitude,
          referenceNumber: payload.referenceNumber,
          notes: payload.notes
        }
      });

      return event;
    });

    // Blockchain anchor
    BlockchainService.anchorRecord(
      'SUPPLY_CHAIN_EVENT', 
      result.id, 
      1, 
      HashingService.getSupplyChainEventPayload(result), 
      Role.DISTRIBUTOR
    ).catch(err => console.error('Blockchain anchor failed for BATCH_DELIVERED:', err));

    NotificationService.createNotification({
      userId: batch.producerProfile.userId,
      type: 'BATCH_DELIVERED',
      title: 'Batch Delivered',
      message: `Batch ${batch.batchNumber} has been delivered.`,
      entityType: 'SUPPLY_CHAIN_EVENT',
      entityId: result.id,
      eventKey: `BATCH_DELIVERED:${result.id}`,
      priority: 'NORMAL'
    });

    await AuditService.recordStateChange({
      action: 'BATCH_DELIVERED',
      actorId: distributorId,
      entityType: 'SupplyChainEvent',
      entityId: result.id,
      newState: { quantity: payload.quantity, location: payload.destination },
    });

    return result;
  }
}
