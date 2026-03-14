import { Request, Response } from 'express';
import Coupon from '../models/Coupon';

/**
 * POST /api/coupons/validate
 * Public — validate a coupon code against an order subtotal
 */
export const validateCoupon = async (req: Request, res: Response): Promise<void> => {
    try {
        const { code, orderAmount } = req.body as { code: string; orderAmount: number };

        if (!code || typeof orderAmount !== 'number') {
            res.status(400).json({ error: 'code and orderAmount are required' });
            return;
        }

        const coupon = await Coupon.findOne({ code: code.toUpperCase().trim(), isActive: true });

        if (!coupon) {
            res.status(404).json({ error: 'Invalid or expired coupon code' });
            return;
        }

        if (new Date() > coupon.expiresAt) {
            res.status(400).json({ error: 'This coupon has expired' });
            return;
        }

        if (coupon.usedCount >= coupon.usageLimit) {
            res.status(400).json({ error: 'This coupon has reached its usage limit' });
            return;
        }

        if (orderAmount < coupon.minOrderAmount) {
            res.status(400).json({
                error: `Minimum order amount of ₹${coupon.minOrderAmount} required for this coupon`,
            });
            return;
        }

        // Calculate discount
        let discount = 0;
        if (coupon.discountType === 'percent') {
            discount = Math.round((orderAmount * coupon.discountValue) / 100);
            if (coupon.maxDiscount) {
                discount = Math.min(discount, coupon.maxDiscount);
            }
        } else {
            discount = coupon.discountValue;
        }

        discount = Math.min(discount, orderAmount); // cannot exceed order total

        res.status(200).json({
            valid: true,
            code: coupon.code,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            discount,
            finalAmount: orderAmount - discount,
        });
    } catch (error: any) {
        console.error('Validate coupon error:', error);
        res.status(500).json({ error: 'Failed to validate coupon' });
    }
};

/**
 * POST /api/coupons
 * Admin only — create a new coupon
 */
export const createCoupon = async (req: Request, res: Response): Promise<void> => {
    try {
        const { code, discountType, discountValue, minOrderAmount, maxDiscount, usageLimit, expiresAt } = req.body;

        if (!code || !discountType || !discountValue || !expiresAt) {
            res.status(400).json({ error: 'code, discountType, discountValue, and expiresAt are required' });
            return;
        }

        const existing = await Coupon.findOne({ code: code.toUpperCase().trim() });
        if (existing) {
            res.status(409).json({ error: 'A coupon with this code already exists' });
            return;
        }

        const coupon = await Coupon.create({
            code: code.toUpperCase().trim(),
            discountType,
            discountValue,
            minOrderAmount: minOrderAmount || 0,
            maxDiscount,
            usageLimit: usageLimit || 1000,
            expiresAt: new Date(expiresAt),
        });

        res.status(201).json(coupon);
    } catch (error: any) {
        console.error('Create coupon error:', error);
        res.status(500).json({ error: error.message || 'Failed to create coupon' });
    }
};

/**
 * GET /api/coupons
 * Admin only — list all coupons
 */
export const getAllCoupons = async (_req: Request, res: Response): Promise<void> => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        res.status(200).json(coupons);
    } catch (error: any) {
        console.error('Get coupons error:', error);
        res.status(500).json({ error: 'Failed to fetch coupons' });
    }
};

/**
 * DELETE /api/coupons/:id
 * Admin only — deactivate a coupon
 */
export const deactivateCoupon = async (req: Request, res: Response): Promise<void> => {
    try {
        const coupon = await Coupon.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );
        if (!coupon) {
            res.status(404).json({ error: 'Coupon not found' });
            return;
        }
        res.status(200).json({ message: 'Coupon deactivated', coupon });
    } catch (error: any) {
        console.error('Deactivate coupon error:', error);
        res.status(500).json({ error: 'Failed to deactivate coupon' });
    }
};
