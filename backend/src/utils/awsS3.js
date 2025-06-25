import 'dotenv/config';
import { S3Client } from '@aws-sdk/client-s3';

// Create S3 client using AWS SDK v3
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Export the client for use in other modules
export default s3Client;