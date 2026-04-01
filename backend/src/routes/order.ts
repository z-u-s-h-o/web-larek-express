import express from 'express';
import createOrder from '../controllers/order';
import { validateOrder } from '../middleware/validators/order';

const router = express.Router();

router.post('/', validateOrder, createOrder);

export default router;
