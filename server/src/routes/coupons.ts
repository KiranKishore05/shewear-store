import express from 'express';
import { authenticateUser } from '../middleware/auth';
import {
    validateCoupon,
    createCoupon,
    getAllCoupons,
    deactivateCoupon,
} from '../controllers/couponController';

const router = express.Router();

// Public — anyone can validate a coupon at checkout
router.post('/validate', validateCoupon);

// Admin-protected routes
router.use(authenticateUser);
router.post('/', createCoupon);
router.get('/', getAllCoupons);
router.delete('/:id', deactivateCoupon);

export default router;
