import { Router } from 'express';
import { BlockchainController } from '../controllers/blockchain.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';
import { Role } from '@prisma/client';

const router = Router();
const controller = new BlockchainController();

// Only ADMIN, VERIFICATION_AUTHORITY, LAB can trigger anchor (retry)
router.post(
  '/anchor/:entityType/:entityId',
  authenticate,
  authorize('ADMIN', 'VERIFICATION_AUTHORITY', 'LAB'),
  controller.anchorRecord.bind(controller)
);

// Any authenticated user can verify
router.get(
  '/verify/:entityType/:entityId',
  authenticate,
  controller.verifyRecord.bind(controller)
);

// Any authenticated user can get history
router.get(
  '/history/:entityType/:entityId',
  authenticate,
  controller.getHistory.bind(controller)
);

export default router;
