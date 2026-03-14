import mongoose, { Schema, Document } from 'mongoose';

export interface ICoupon extends Document {
    code: string;
    discountType: 'percent' | 'flat';
    discountValue: number;
    minOrderAmount: number;
    maxDiscount?: number;
    usageLimit: number;
    usedCount: number;
    expiresAt: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const CouponSchema: Schema = new Schema(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },
        discountType: {
            type: String,
            enum: ['percent', 'flat'],
            required: true,
        },
        discountValue: { type: Number, required: true, min: 1 },
        minOrderAmount: { type: Number, default: 0, min: 0 },
        maxDiscount: { type: Number, min: 1 },
        usageLimit: { type: Number, default: 1000 },
        usedCount: { type: Number, default: 0 },
        expiresAt: { type: Date, required: true },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export default mongoose.model<ICoupon>('Coupon', CouponSchema);
