import { Router } from 'express';
import { BlockchainController } from '../controllers/blockchain.controller';
import { protect, restrictTo } from '../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();
const controller = new BlockchainController();

// Only ADMIN, VERIFICATION_AUTHORITY, LAB can trigger anchor (retry)
router.post(
  '/anchor/:entityType/:entityId',
  protect,
  restrictTo(Role.ADMIN, Role.VERIFICATION_AUTHORITY, Role.LAB),
  controller.anchorRecord.bind(controller)
);

// Any authenticated user can verify
router.get(
  '/verify/:entityType/:entityId',
  protect,
  controller.verifyRecord.bind(controller)
);

// Any authenticated user can get history
router.get(
  '/history/:entityType/:entityId',
  protect,
  controller.getHistory.bind(controller)
);

export default router;
