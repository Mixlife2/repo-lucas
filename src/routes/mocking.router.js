import { Router } from 'express';
import { mockingProducts } from '../controllers/mockingController.js';

const router = Router()
router.get('/mockingproducts' , mockingProducts);

export default router;