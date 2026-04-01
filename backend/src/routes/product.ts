import express from 'express';
import {
  getProducts, createProduct, updateProduct, deleteProduct,
} from '../controllers/product';
import { validateProduct, validateProductId } from '../middleware/validators/product';
import auth from '../middleware/auth';

const router = express.Router();

router.get('/', getProducts);
router.post('/', auth, validateProduct, createProduct);
router.patch('/:productId', auth, validateProductId, validateProduct, updateProduct);
router.delete('/:productId', auth, validateProductId, deleteProduct);

export default router;
