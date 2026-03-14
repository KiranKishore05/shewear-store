import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Coupon from '../models/Coupon';

// Load server/.env so local and Atlas URIs both work depending on your config
dotenv.config({ path: path.join(__dirname, '../../.env') });

const DEFAULT_MONGO_URI = 'mongodb://127.0.0.1:27017/shewear';

async function seedCoupons(): Promise<void> {
    const mongoUri = process.env.MONGODB_URI || DEFAULT_MONGO_URI;

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    await Coupon.deleteMany({ code: { $in: ['SAVE10', 'FLAT100', 'FIRST50'] } });

    await Coupon.insertMany([
        {
            code: 'SAVE10',
            discountType: 'percent',
            discountValue: 10,
            minOrderAmount: 500,
            maxDiscount: 200,
            usageLimit: 1000,
            expiresAt: new Date('2027-12-31'),
        },
        {
            code: 'FLAT100',
            discountType: 'flat',
            discountValue: 100,
            minOrderAmount: 800,
            usageLimit: 500,
            expiresAt: new Date('2027-12-31'),
        },
        {
            code: 'FIRST50',
            discountType: 'percent',
            discountValue: 50,
            minOrderAmount: 0,
            maxDiscount: 150,
            usageLimit: 100,
            expiresAt: new Date('2027-12-31'),
        },
    ]);

    console.log('✅ 3 test coupons inserted: SAVE10, FLAT100, FIRST50');
}

seedCoupons()
    .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('❌ Failed to seed coupons:', message);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.disconnect();
    });
