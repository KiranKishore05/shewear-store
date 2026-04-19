import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

// Ensure env is loaded - do this before any cloudinary calls
if (!process.env.CLOUDINARY_API_KEY) {
    dotenv.config();
}

// Debug: log what we're getting
console.log('🔧 Cloudinary Config:', {
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ? '✓ set' : '✗ missing',
    api_key: process.env.CLOUDINARY_API_KEY ? '✓ set' : '✗ missing',
    api_secret: process.env.CLOUDINARY_API_SECRET ? '✓ set' : '✗ missing',
});

// Configure cloudinary with explicit check
const cloudinaryConfig = {
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
};

if (!cloudinaryConfig.api_key || !cloudinaryConfig.api_secret || !cloudinaryConfig.cloud_name) {
    console.error('❌ CRITICAL: Cloudinary credentials missing!', cloudinaryConfig);
}

cloudinary.config(cloudinaryConfig);

export const uploadToCloudinary = async (fileBuffer: Buffer): Promise<string> => {
    // Validate credentials are loaded
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
        throw new Error('Cloudinary cloud_name not configured');
    }

    // Try signed upload first (with API key/secret)
    if (process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
        try {
            return await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'shewear-products',
                        resource_type: 'auto',
                    },
                    (error, result) => {
                        if (error) {
                            console.warn('Signed upload failed, trying unsigned:', error.message);
                            reject(error);
                        } else if (result?.secure_url) {
                            resolve(result.secure_url);
                        } else {
                            reject(new Error('No URL returned'));
                        }
                    }
                );
                uploadStream.on('error', reject);
                uploadStream.end(fileBuffer);
            });
        } catch (signedError) {
            console.log('Signed upload failed, attempting unsigned upload...');
            // Fall through to unsigned upload
        }
    }

    // Fallback: Use unsigned upload if signed failed or no credentials
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'ml_default';

    // Use direct HTTP call for unsigned upload (bypasses signature issues)
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                unsigned: true,
                upload_preset: uploadPreset,
                folder: 'shewear-products',
            },
            (error, result) => {
                if (error) {
                    console.error('Unsigned upload failed:', error.message);
                    reject(new Error(`Cloudinary upload failed: ${error.message}`));
                } else if (result?.secure_url) {
                    console.log('✅ Image uploaded to Cloudinary:', result.secure_url);
                    resolve(result.secure_url);
                } else {
                    reject(new Error('Upload succeeded but no URL returned'));
                }
            }
        );
        uploadStream.on('error', reject);
        uploadStream.end(fileBuffer);
    });
};

export default cloudinary;
