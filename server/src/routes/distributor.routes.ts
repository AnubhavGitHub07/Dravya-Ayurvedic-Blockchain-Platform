import { Router } from 'express';
import { DistributorController } from '../controllers/distributor.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';

const router = Router();
const controller = new DistributorController();

router.use(authenticate);
router.use(authorize('DISTRIBUTOR'));

router.get('/me/dashboard', controller.getDashboard.bind(controller));
router.get('/me/batches', controller.getAssignedBatches.bind(controller));
router.post('/me/batches/:id/receive', controller.receiveBatch.bind(controller));
router.post('/me/batches/:id/dispatch', controller.dispatchBatch.bind(controller));
router.post('/me/batches/:id/deliver', controller.deliverBatch.bind(controller));

export default router;
