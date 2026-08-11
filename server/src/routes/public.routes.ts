import { Router } from 'express';
import { PublicController } from '../controllers/public.controller';

const router = Router();
const controller = new PublicController();

// No authentication required
router.get('/verify/:code', controller.verifyQR.bind(controller));

export default router;
