import cloudinary from "../utils/cloudinary.js";
import {Readable} from 'stream';
import s3Client from "../utils/awsS3.js";
import { PutObjectCommand } from '@aws-sdk/client-s3';
import path from 'path';
import {v4 as uuidv4} from 'uuid';


// method to uplaod to cloudinary for now.
const uploadToCloudinary = async (file, folderPath, originalPath) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: folderPath,
        resource_type: 'image',
        public_id: `${path.parse(file.originalname).name}_${Date.now()}`,
        use_filename: true,
        unique_filename: false,
        overwrite: false,
        // Preserve folder structure from client
        tags: originalPath ? [originalPath] : [],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          url: result.secure_url,
          public_id: result.public_id,
          folder: result.folder,
          original_filename: file.originalname,
          size: file.size,
          format: result.format,
          resource_type: result.resource_type,
        });
      }
    );
    
    Readable.from(file.buffer).pipe(stream);
  });
};

// method to upload to amazon s3 for future productuon
export const uploadToS3 = async (file, folderPath, originalPath) => {
  const key = `${folderPath}/${file.originalname}`;
  
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    Metadata: {
      originalPath: originalPath || '',
      uploadedAt: new Date().toISOString(),
    }
  };

  try {
    const command = new PutObjectCommand(params);
    const result = await s3Client.send(command);
    
    // Construct the URL manually since SDK v3 doesn't return Location
    const url = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    
    return {
      url: url,
      key: key,
      bucket: process.env.AWS_S3_BUCKET_NAME,
      original_filename: file.originalname,
      size: file.size,
      etag: result.ETag,
      versionId: result.VersionId, // Available in v3
    };
  } catch (error) {
    console.error('S3 Upload Error:', error);
    throw error;
  }
};


// this function generates the folder structure in the server or storage bucket as same as that of the user side so nested folders could be structured correctly.
const generateFolderPath = (categoryId, subfolder = '', baseUploadId = null) => {
  if (subfolder) {
    // For nested folders, preserve the exact structure without adding unique identifiers to each subfolder
    return `uploads/${categoryId}/${baseUploadId}/${subfolder}`;
  }
  // Only generate unique identifier at the base level
  const timestamp = Date.now();
  const uniqueId = uuidv4().substring(0, 8);
  return `uploads/${categoryId}/${timestamp}_${uniqueId}`;
};



const mainUploadMethod = async (req, res) => {
  try {
    // Validate request
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'No files uploaded.' 
      });
    }

    // Get upload configuration from request body
    const { 
      categoryId = 'default',
      preserveFolderStructure = true,
      uploadProvider = 's3' // 'cloudinary' or 's3' here by default it is cloudinary
    } = req.body;

    // Validate categoryId (basic sanitization) this for cleaning messy lines to the category or path. for server safety
    const sanitizedCategoryId = categoryId.replace(/[^a-zA-Z0-9_-]/g, '');
    if (!sanitizedCategoryId) {
      return res.status(400).json({
        success: false,
        error: 'Invalid category ID'
      });
    }

    console.log(`Starting upload of ${req.files.length} files to ${uploadProvider}`);

    // Generate a single base upload ID for this entire upload session
    const timestamp = Date.now();
    const uniqueId = uuidv4().substring(0, 8);
    const baseUploadId = `${timestamp}_${uniqueId}`;

    // Process files with folder structure preservation
    const uploadPromises = req.files.map(async (file) => {
      try {
        // Extract folder path from webkitRelativePath if available
        let originalPath = '';
        let folderPath = generateFolderPath(sanitizedCategoryId);
        
        if (preserveFolderStructure && file.fieldname.includes('webkitRelativePath')) {
          // Handle folder structure from drag & drop
          originalPath = file.originalname.includes('/') ? 
            path.dirname(file.originalname) : '';
          
          if (originalPath) {
            // Use the same baseUploadId for all files to maintain folder structure
            folderPath = generateFolderPath(sanitizedCategoryId, originalPath, baseUploadId);
          } else {
            // For files in root, use the base folder with baseUploadId
            folderPath = `uploads/${sanitizedCategoryId}/${baseUploadId}`;
          }
        } else {
          // For non-folder uploads, use the base folder with baseUploadId
          folderPath = `uploads/${sanitizedCategoryId}/${baseUploadId}`;
        }

        // Upload based on provider
        let result;
        if (uploadProvider === 's3') {
          result = await uploadToS3(file, folderPath, originalPath);
        } else {
          result = await uploadToCloudinary(file, folderPath, originalPath);
        }

        return {
          success: true,
          ...result,
          originalPath: originalPath,
        };
      } catch (error) {
        console.error(`Error uploading file ${file.originalname}:`, error);
        return {
          success: false,
          filename: file.originalname,
          error: error.message,
        };
      }
    });

    // Wait for all uploads to complete (a promise function for all the files to upload returns a collective array of promise as soon as all files get uploaded ot the server.)
    const results = await Promise.all(uploadPromises);
    
    // Separate successful and failed uploads
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    // Log results
    console.log(`Upload completed: ${successful.length} successful, ${failed.length} failed`);

    // Return comprehensive response
    res.json({
      success: true,
      message: `Upload completed: ${successful.length}/${results.length} files uploaded successfully`,
      stats: {
        total: results.length,
        successful: successful.length,
        failed: failed.length,
      },
      data: {
        successful: successful,
        failed: failed.length > 0 ? failed : undefined,
      },
      uploadProvider: uploadProvider,
      categoryId: sanitizedCategoryId,
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // Handle multer errors specifically

    // this is for maximum file size limit.
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          error: 'File size too large. Maximum 10MB per file.'
        });
      }

      // this is for maximum file limit.
      if (error.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          success: false,
          error: 'Too many files. Maximum 100 files allowed.'
        });
      }
    }

    res.status(500).json({
      success: false,
      error: 'Upload failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// making this temporary function for toggling between cloudinary and s3 buckets.
const setUploadProvider = (req, res) => {
  const { provider } = req.body;
  
  if (!['cloudinary', 's3'].includes(provider)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid provider. Must be "cloudinary" or "s3"'
    });
  }

  // so we can store this provider value in some state , local storage or a cookie and then use it in future.
  // i would suggest to better use it with local storage or state.
  res.json({
    success: true,
    message: `Upload provider set to ${provider}`,
    provider: provider
  });
}


export {
  mainUploadMethod , setUploadProvider
}