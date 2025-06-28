import 'dotenv/config';
import { HeadObjectCommand } from '@aws-sdk/client-s3';
import s3Client from '../utils/awsS3.js';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import Image from '../db/schema/image.schema.js'; // Import the Image model


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

// File validation function (enhanced from first approach)
// this is actually added because of the ai team so we could add images with the correct mime type
const validateFile = (fileInfo) => {
  const allowedMimes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
  ];
  
  // Validate required fields
  if (!fileInfo.name || !fileInfo.type) {
    throw new Error('File name and type are required');
  }

  // Validate file type
  if (!allowedMimes.includes(fileInfo.type)) {
    throw new Error(`Invalid file type: ${fileInfo.type}. Only images (JPEG, JPG, PNG) are allowed.`);
  }

  // Validate file size (100MB limit)
  if (fileInfo.size && fileInfo.size > 100 * 1024 * 1024) {
    throw new Error(`File too large: ${fileInfo.name}. Maximum 100MB per file.`);
  }

  // Validate filename for security
  const sanitizedName = fileInfo.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  if (sanitizedName !== fileInfo.name) {
    console.warn(`Filename sanitized: ${fileInfo.name} -> ${sanitizedName}`);
  }

  return sanitizedName;
};

// Generate pre-signed URLs for direct upload (enhanced version)

/* this will generate a presigned url for each folder upload . 
   a presigned url is basically a method that aws or any other cloud provider provides use
   for direct upload of our assets to the cloud this removes the hustle of flow of data through our servers
   and also is scalable as aws maintains the entire architecural flow. basically, this means that we will get a 
   signed url from aws, stating that the aws Admin has given authorisation to the following Admin Panel (Website)
   that he/she can upload data directly to the container or directory on cloud with scale so this can basically upload
   folders upto 10k images with no size restrictions (note ! could be possibly scaled even more than 10k).
   this is a better approach than the previous one as previous one was fine at uploading images for a prototype but
   the major 2 issues were : 
   
   1. not scalable couldn't upload more than 50-100 images at once because of single http timeouts that is basically 30-60 seconds.
   2. even if you scale it with multiple http handshakes or even web socket connection it loaded the server unnecessarily increasing the
      cost of the server + time consuming + not recoverable if assets lost in midway.

    so this approach with pre signed secure urls is better and ideal.
*/

const generatePresignedUrls = async (req, res) => {
  try {
    // Get upload configuration from request body (similar to first approach)
    const {
      files, // Array of file objects: [{ name, size, type, relativePath }]
      categoryId = 'default',
      preserveFolderStructure = true,
      expiresIn = 3600, // 1 hour default expiry
      uploadProvider = 's3' // Keep consistency with first approach
    } = req.body;

    // Comprehensive validation (from first approach style)
    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files provided. Expected array of file objects.'
      });
    }

    // File count validation (enhanced limits) this could be changed.
    if (files.length > 1000) {
      return res.status(400).json({
        success: false,
        error: 'Too many files. Maximum 1,000 files allowed per batch.'
      });
    }

    // Validate and sanitize categoryId (from first approach)
    const sanitizedCategoryId = categoryId.replace(/[^a-zA-Z0-9_-]/g, '');
    if (!sanitizedCategoryId) {
      return res.status(400).json({
        success: false,
        error: 'Invalid category ID'
      });
    }

    console.log(`Starting pre-signed URL generation for ${files.length} files to ${uploadProvider}`);

    // Generate single base upload ID for this entire upload session (from first approach)
    const timestamp = Date.now();
    const uniqueId = uuidv4().substring(0, 8);
    const baseUploadId = `${timestamp}_${uniqueId}`;

    // Process files with enhanced folder structure preservation
    const urlPromises = files.map(async (fileInfo, index) => {
      try {
        // Validate file
        const sanitizedFileName = validateFile(fileInfo);

        // Extract folder path from relativePath if available (enhanced from both approaches)
        let originalPath = '';
        let folderPath = generateFolderPath(sanitizedCategoryId);
        
        if (preserveFolderStructure && fileInfo.relativePath) {
          // Handle folder structure from drag & drop
          originalPath = fileInfo.relativePath.includes('/') ? 
            path.dirname(fileInfo.relativePath) : '';
          
          if (originalPath && originalPath !== '.') {
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

        // Generate unique filename to prevent conflicts (enhanced)
        const fileExtension = path.extname(sanitizedFileName);
        const baseName = path.basename(sanitizedFileName, fileExtension);
        const uniqueFileName = `${baseName}_${Date.now()}_${index}${fileExtension}`;
        const key = `${folderPath}/${uniqueFileName}`; // path address for the file.

        // Create comprehensive pre-signed POST URL with enhanced metadata
        const presignedPost = await createPresignedPost(s3Client, {
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: key,
          Fields: {
            'Content-Type': fileInfo.type,
            'x-amz-meta-original-name': fileInfo.name,
            'x-amz-meta-sanitized-name': sanitizedFileName,
            'x-amz-meta-original-path': originalPath || '',
            'x-amz-meta-upload-session': baseUploadId,
            'x-amz-meta-uploaded-at': new Date().toISOString(),
            'x-amz-meta-category-id': sanitizedCategoryId,
            'x-amz-meta-file-index': index.toString(),
          },
          Conditions: [
            ['content-length-range', 0, 100 * 1024 * 1024], // 100MB max this can also be change by us for increasing decreasing file size
            ['eq', '$Content-Type', fileInfo.type],
            ['starts-with', '$x-amz-meta-original-name', ''],
          ],
          Expires: expiresIn,
        });

        // Construct final URL
        const finalUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

        return {
          success: true,
          originalName: fileInfo.name,
          sanitizedName: sanitizedFileName,
          key: key,
          uploadUrl: presignedPost.url,
          fields: presignedPost.fields,
          finalUrl: finalUrl,
          originalPath: originalPath,
          folderPath: folderPath,
          uploadSessionId: baseUploadId,
          size: fileInfo.size,
          type: fileInfo.type,
        };
      } catch (error) {
        console.error(`Error generating URL for file ${fileInfo.name}:`, error);
        return {
          success: false,
          originalName: fileInfo.name,
          error: error.message,
        };
      }
    });

    // Wait for all URL generations to complete
    const results = await Promise.all(urlPromises);

    // Separate successful and failed generations (from first approach style)
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    // Enhanced logging (from first approach)
    console.log(`Pre-signed URL generation completed: ${successful.length} successful, ${failed.length} failed`);

    // Return comprehensive response (enhanced from first approach)
    res.json({
      success: true,
      message: `Pre-signed URLs generated: ${successful.length}/${results.length} files ready for upload`,
      uploadSessionId: baseUploadId,
      expiresIn: expiresIn,
      expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
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
      preserveFolderStructure: preserveFolderStructure,
    });

  } catch (error) {
    console.error('Pre-signed URL generation error:', error);
    
    // Enhanced error handling (from first approach style)
    if (error.name === 'CredentialsError') {
      return res.status(500).json({
        success: false,
        error: 'AWS credentials configuration error'
      });
    }

    if (error.name === 'NetworkError') {
      return res.status(500).json({
        success: false,
        error: 'Network error while connecting to AWS S3'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to generate pre-signed URLs',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};



// Enhanced upload completion handler with comprehensive tracking
const handleUploadComplete = async (req, res) => {
  try {
    const {
      uploadSessionId,
      files, // Array of completed file info: [{ key, originalName, finalUrl, status, size, etag, folderPath, weddingId }]
      categoryId,
      metadata = {}
    } = req.body;

    // Comprehensive validation
    if (!uploadSessionId || !files || !Array.isArray(files)) {
      return res.status(400).json({
        success: false,
        error: 'Upload session ID and files array are required'
      });
    }

    if (files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files provided in completion request'
      });
    }

    console.log(`Processing upload completion for session: ${uploadSessionId}`);
    console.log(`Files completed: ${files.length}`);

    // Verify files exist in S3 (enhanced verification)
    const verificationPromises = files.map(async (file) => {
      try {
        const headCommand = new HeadObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: file.key
        });
        
        const headResult = await s3Client.send(headCommand);
        
        return {
          ...file,
          verified: true,
          actualSize: headResult.ContentLength,
          lastModified: headResult.LastModified,
          etag: headResult.ETag,
          contentType: headResult.ContentType,
        };
      } catch (error) {
        console.error(`Failed to verify file ${file.key}:`, error);
        return {
          ...file,
          verified: false,
          verificationError: error.message,
        };
      }
    });

    const verifiedFiles = await Promise.all(verificationPromises);
    const successfulFiles = verifiedFiles.filter(f => f.verified);
    const failedFiles = verifiedFiles.filter(f => !f.verified);


    // NOTE : I have to implement this section so that we store the image urls for the client to our database.


    // Here you would typically store in database (placeholder for actual implementation)
    /*
    const uploadSession = {
      sessionId: uploadSessionId,
      categoryId: categoryId,
      status: failedFiles.length === 0 ? 'completed' : 'partial',
      totalFiles: files.length,
      successfulFiles: successfulFiles.length,
      failedFiles: failedFiles.length,
      completedAt: new Date(),
      metadata: metadata,
    };
    
    // Store session and file metadata
    await storeUploadSession(uploadSession);
    await storeFileMetadata(successfulFiles);
    */

    // Store image details and URLs in MongoDB for successful files
    if (successfulFiles.length > 0) {
      const imageDocs = successfulFiles.map(file => ({
        url: file.finalUrl,
        categoryId: categoryId,
        weddingId: file.weddingId || undefined,
        folderPath: file.folderPath || undefined,
        originalName: file.originalName || undefined,
        key: file.key || undefined,
        size: file.actualSize || file.size || undefined,
        uploadedAt: file.lastModified ? new Date(file.lastModified) : new Date(),
      }));
      console.log(imageDocs)
      await Image.insertMany(imageDocs);
    }

    // Enhanced response (from first approach style)
    res.json({
      success: true,
      message: `Upload session ${uploadSessionId} processed: ${successfulFiles.length}/${files.length} files verified successfully`,
      uploadSessionId: uploadSessionId,
      stats: {
        total: files.length,
        successful: successfulFiles.length,
        failed: failedFiles.length,
        totalSize: successfulFiles.reduce((sum, file) => sum + (file.actualSize || 0), 0),
      },
      data: {
        successful: successfulFiles,
        failed: failedFiles.length > 0 ? failedFiles : undefined,
      },
      completedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Upload completion handling error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process upload completion',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};



// Enhanced upload status checker with detailed information
const getUploadStatus = async (req, res) => {
  try {
    const { uploadSessionId } = req.params;
    const { includeFiles = false } = req.query;

    if (!uploadSessionId) {
      return res.status(400).json({
        success: false,
        error: 'Upload session ID is required'
      });
    }

    // Here you would query your database for session status
    // Enhanced placeholder implementation
    /*
    const session = await UploadSession.findOne({ sessionId: uploadSessionId });
    const files = includeFiles ? await FileMetadata.find({ sessionId: uploadSessionId }) : [];
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Upload session not found'
      });
    }
    
    return res.json({
      success: true,
      uploadSessionId: uploadSessionId,
      status: session.status,
      categoryId: session.categoryId,
      totalFiles: session.totalFiles,
      completedFiles: session.successfulFiles,
      failedFiles: session.failedFiles,
      createdAt: session.createdAt,
      completedAt: session.completedAt,
      files: includeFiles ? files : undefined,
      totalSize: session.totalSize,
      metadata: session.metadata,
    });
    */

    // Enhanced placeholder response
    res.json({
      success: true,
      uploadSessionId: uploadSessionId,
      status: 'in_progress', // completed, failed, in_progress, partial
      totalFiles: 0,
      completedFiles: 0,
      failedFiles: 0,
      createdAt: new Date().toISOString(),
      completedAt: null,
      totalSize: 0,
      includeFiles: includeFiles,
      // files: includeFiles ? [] : undefined
    });

  } catch (error) {
    console.error('Upload status check error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get upload status',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


// we aren't using this now as cloudinary is not implemented it keeping this for future need.
// Helper function for setting upload provider (from first approach)
const setUploadProvider = (req, res) => {
  const { provider } = req.body;
  
  if (!['cloudinary', 's3'].includes(provider)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid provider. Must be "cloudinary" or "s3"'
    });
  }

  res.json({
    success: true,
    message: `Upload provider set to ${provider}`,
    provider: provider,
    timestamp: new Date().toISOString(),
  });
};


// Enhanced file deletion function
const deleteUploadedFiles = async (req, res) => {
  try {
    const { keys } = req.body; // Array of S3 keys to delete

    if (!keys || !Array.isArray(keys) || keys.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No keys provided for deletion'
      });
    }

    // Implementation would go here for batch deletion
    /*
    const deleteResults = await Promise.all(
      keys.map(async (key) => {
        try {
          await s3Client.send(new DeleteObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: key
          }));
          return { key, success: true };
        } catch (error) {
          return { key, success: false, error: error.message };
        }
      })
    );
    */

    res.json({
      success: true,
      message: `Deletion request processed for ${keys.length} files`,
      // results: deleteResults
    });

  } catch (error) {
    console.error('File deletion error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete files',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export {
  generatePresignedUrls,
  handleUploadComplete,
  getUploadStatus,
  setUploadProvider,
  deleteUploadedFiles
};



/* -------------------------------- older approach ------------------------------------- */

// method to uplaod to cloudinary for now.

// const uploadToCloudinary = async (file, folderPath, originalPath) => {
//   return new Promise((resolve, reject) => {
//     const stream = cloudinary.uploader.upload_stream(
//       {
//         folder: folderPath,
//         resource_type: 'image',
//         public_id: `${path.parse(file.originalname).name}_${Date.now()}`,
//         use_filename: true,
//         unique_filename: false,
//         overwrite: false,
//         // Preserve folder structure from client
//         tags: originalPath ? [originalPath] : [],
//       },
//       (error, result) => {
//         if (error) return reject(error);
//         resolve({
//           url: result.secure_url,
//           public_id: result.public_id,
//           folder: result.folder,
//           original_filename: file.originalname,
//           size: file.size,
//           format: result.format,
//           resource_type: result.resource_type,
//         });
//       }
//     );
    
//     Readable.from(file.buffer).pipe(stream);
//   });
// };


// // method to upload to amazon s3 for future productuon
// export const uploadToS3 = async (file, folderPath, originalPath) => {
//   const key = `${folderPath}/${file.originalname}`;
  
//   const params = {
//     Bucket: process.env.AWS_S3_BUCKET_NAME,
//     Key: key,
//     Body: file.buffer,
//     ContentType: file.mimetype,
//     Metadata: {
//       originalPath: originalPath || '',
//       uploadedAt: new Date().toISOString(),
//     }
//   };

//   try {
//     const command = new PutObjectCommand(params);
//     const result = await s3Client.send(command);
    
//     // Construct the URL manually since SDK v3 doesn't return Location
//     const url = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    
//     return {
//       url: url,
//       key: key,
//       bucket: process.env.AWS_S3_BUCKET_NAME,
//       original_filename: file.originalname,
//       size: file.size,
//       etag: result.ETag,
//       versionId: result.VersionId, // Available in v3
//     };
//   } catch (error) {
//     console.error('S3 Upload Error:', error);
//     throw error;
//   }
// };

// older approach with server side flow (Not Scalable).

// const mainUploadMethod = async (req, res) => {
//   try {
//     // Validate request
//     if (!req.files || req.files.length === 0) {
//       return res.status(400).json({ 
//         success: false,
//         error: 'No files uploaded.' 
//       });
//     }

//     // Get upload configuration from request body
//     const { 
//       categoryId = 'default',
//       preserveFolderStructure = true,
//       uploadProvider = 's3' // 'cloudinary' or 's3' here by default it is cloudinary
//     } = req.body;

//     // Validate categoryId (basic sanitization) this for cleaning messy lines to the category or path. for server safety
//     const sanitizedCategoryId = categoryId.replace(/[^a-zA-Z0-9_-]/g, '');
//     if (!sanitizedCategoryId) {
//       return res.status(400).json({
//         success: false,
//         error: 'Invalid category ID'
//       });
//     }

//     console.log(`Starting upload of ${req.files.length} files to ${uploadProvider}`);

//     // Generate a single base upload ID for this entire upload session
//     const timestamp = Date.now();
//     const uniqueId = uuidv4().substring(0, 8);
//     const baseUploadId = `${timestamp}_${uniqueId}`;

//     // Process files with folder structure preservation
//     const uploadPromises = req.files.map(async (file) => {
//       try {
//         // Extract folder path from webkitRelativePath if available
//         let originalPath = '';
//         let folderPath = generateFolderPath(sanitizedCategoryId);
        
//         if (preserveFolderStructure && file.fieldname.includes('webkitRelativePath')) {
//           // Handle folder structure from drag & drop
//           originalPath = file.originalname.includes('/') ? 
//             path.dirname(file.originalname) : '';
          
//           if (originalPath) {
//             // Use the same baseUploadId for all files to maintain folder structure
//             folderPath = generateFolderPath(sanitizedCategoryId, originalPath, baseUploadId);
//           } else {
//             // For files in root, use the base folder with baseUploadId
//             folderPath = `uploads/${sanitizedCategoryId}/${baseUploadId}`;
//           }
//         } else {
//           // For non-folder uploads, use the base folder with baseUploadId
//           folderPath = `uploads/${sanitizedCategoryId}/${baseUploadId}`;
//         }

//         // Upload based on provider
//         let result;
//         if (uploadProvider === 's3') {
//           result = await uploadToS3(file, folderPath, originalPath);
//         } else {
//           result = await uploadToCloudinary(file, folderPath, originalPath);
//         }

//         return {
//           success: true,
//           ...result,
//           originalPath: originalPath,
//         };
//       } catch (error) {
//         console.error(`Error uploading file ${file.originalname}:`, error);
//         return {
//           success: false,
//           filename: file.originalname,
//           error: error.message,
//         };
//       }
//     });

//     // Wait for all uploads to complete (a promise function for all the files to upload returns a collective array of promise as soon as all files get uploaded ot the server.)
//     const results = await Promise.all(uploadPromises);
    
//     // Separate successful and failed uploads
//     const successful = results.filter(r => r.success);
//     const failed = results.filter(r => !r.success);

//     // Log results
//     console.log(`Upload completed: ${successful.length} successful, ${failed.length} failed`);

//     // Return comprehensive response
//     res.json({
//       success: true,
//       message: `Upload completed: ${successful.length}/${results.length} files uploaded successfully`,
//       stats: {
//         total: results.length,
//         successful: successful.length,
//         failed: failed.length,
//       },
//       data: {
//         successful: successful,
//         failed: failed.length > 0 ? failed : undefined,
//       },
//       uploadProvider: uploadProvider,
//       categoryId: sanitizedCategoryId,
//     });

//   } catch (error) {
//     console.error('Upload error:', error);
    
//     // Handle multer errors specifically

//     // this is for maximum file size limit.
//     if (error instanceof multer.MulterError) {
//       if (error.code === 'LIMIT_FILE_SIZE') {
//         return res.status(400).json({
//           success: false,
//           error: 'File size too large. Maximum 10MB per file.'
//         });
//       }

//       // this is for maximum file limit.
//       if (error.code === 'LIMIT_FILE_COUNT') {
//         return res.status(400).json({
//           success: false,
//           error: 'Too many files. Maximum 100 files allowed.'
//         });
//       }
//     }

//     res.status(500).json({
//       success: false,
//       error: 'Upload failed',
//       details: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// making this temporary function for toggling between cloudinary and s3 buckets.


// no need for this function as only awsS3 is being used for production so i removed this. still keeping as commented just in case for future use.
 
// const setUploadProvider = (req, res) => {
//   const { provider } = req.body;
  
//   if (!['cloudinary', 's3'].includes(provider)) {
//     return res.status(400).json({
//       success: false,
//       error: 'Invalid provider. Must be "cloudinary" or "s3"'
//     });
//   }

//   // so we can store this provider value in some state , local storage or a cookie and then use it in future.
//   // i would suggest to better use it with local storage or state.
//   res.json({
//     success: true,
//     message: `Upload provider set to ${provider}`,
//     provider: provider
//   });
// }

// export {
//   mainUploadMethod , setUploadProvider
// }