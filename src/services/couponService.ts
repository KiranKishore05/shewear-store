import { api } from './api';

export interface CouponValidationResult {
    valid: boolean;
    code: string;
    discountType: 'percent' | 'flat';
    discountValue: number;
    discount: number;
    finalAmount: number;
}

export const couponService = {
    async validateCoupon(code: string, orderAmount: number): Promise<CouponValidationResult> {
        const response = await api.post('/coupons/validate', { code, orderAmount });
        return response.data;
    },
};
