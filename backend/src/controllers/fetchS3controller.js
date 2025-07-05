import mongoose from 'mongoose';
import Category from '../models/category.schema.js';
import Image from '../models/image.schema.js';
import s3Client from '../utils/awsS3.js';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Fetch all categories and their images for a given weddingId, and generate presigned GET URLs for each image
const getWeddingImagesWithPresignedUrls = async (req, res) => {
    try {
        const { weddingId } = req.body;
        if (!weddingId || !mongoose.Types.ObjectId.isValid(weddingId)) {
            return res.status(400).json({ success: false, error: 'Invalid or missing weddingId' });
        }

        const categories = await Category.find({ weddingId: weddingId }).lean();
        if (!categories || categories.length === 0) {
            return res.json({ success: true, data: [], message: 'No categories found for this wedding.' });
        }

        // For each category, fetch its images and generate presigned URLs
        const result = await Promise.all(categories.map(async (cat) => {
            // Fetch images for this category
            const images = await Image.find({ categoryId: cat._id }).lean();
            // Generate presigned URLs for each image
            const imageUrls = await Promise.all(images.map(async (img) => {
                try {
                    const command = new GetObjectCommand({
                        Bucket: process.env.AWS_S3_BUCKET_NAME,
                        Key: img.key,
                    });
                    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
                    return {
                        _id: img._id,
                        url,
                        originalName: img.originalName,
                        key: img.key,
                        size: img.size,
                        uploadedAt: img.uploadedAt,
                    };
                } catch (err) {
                    return null;
                }
            }));
            return {
                categoryId: cat._id,
                categoryTitle: cat.title,
                images: imageUrls.filter(Boolean),
            };
        }));

        res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error('Error fetching wedding images with presigned URLs:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch images' });
    }
};

// GET /api/images/presigned/:key
const getImagePresignedUrl = async (req, res) => {
    try {
        const { key } = req.body;
        if (!key) {
            return res.status(400).json({ success: false, error: 'No key provided' });
        }

        const command = new GetObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: key,
        });

        // URL expires in 1 hour (3600 seconds)
        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

        res.json({ success: true, url });
    } catch (error) {
        console.error('Error generating presigned GET URL:', error);
        res.status(500).json({ success: false, error: 'Failed to generate presigned URL' });
    }
};

export {
    // ...existing exports
    getImagePresignedUrl, getWeddingImagesWithPresignedUrls
};