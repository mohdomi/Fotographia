import 'dotenv/config';
import mongoose from 'mongoose';
import { HeadObjectCommand } from '@aws-sdk/client-s3';
import s3Client from '../utils/awsS3.js';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import Image from '../models/image.schema.js'; // Import the Image model
import Project from '../models/project.schema.js';
import Category from '../models/category.schema.js';
import { createCategoriesFromFolders,createCategoriesFromPaths,createCategoriesFromFolderNames,getLeafFolders } from '../utils/categoryCreation.js'


// this function generates the folder structure in the server or storage bucket as same as that of the user side so nested folders could be structured correctly.
const generateFolderPath = (weddingName, subfolder = '', baseUploadId = null) => {
  if (subfolder) {
    // For nested folders, preserve the exact structure without adding unique identifiers to each subfolder
    return `uploads/${weddingName}/${baseUploadId}/${subfolder}`;
  }
  // Only generate unique identifier at the base level
  const timestamp = Date.now();
  const uniqueId = uuidv4().substring(0, 8);
  return `uploads/${weddingName}/${timestamp}_${uniqueId}`;
};

// File validation function (enhanced from first approach)
// this is actually added because of the ai team so we could add images with the correct mime type
const validateFile = (fileInfo) => {
  // we can add more mime types here
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

  // Validate file size (100MB limit) can be increased
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
      weddingName,
      mobile_no,
      packages,
      preserveFolderStructure = true,
      expiresIn = 3600, // 1 hour default expiry
      uploadProvider = 's3' // Keep consistency with first approach
    } = req.body;

    // Comprehensive validation
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

    // we need to change this with some effiicient naming for future.
    const root_folder_name = weddingName.trim() + "_" + mobile_no;

    console.log(`Starting pre-signed URL generation for ${files.length} files to ${uploadProvider}`);

    // Generate single base upload ID for this entire upload session (from first approach)
    // THIS WILL BE CHANGED WHEN I WILL DO THE CATEGORY REMVOAL FROM FOLDER STRUCTURE
    const timestamp = Date.now();
    const uniqueId = uuidv4().substring(0, 8);
    const baseUploadId = `${timestamp}_${uniqueId}`; 

    // creating a project for the entire create prject route from the frontend according to the schema.
    // create a wedding object and a category according to the last path address before the file.

      let project;
      try { 
        
        project = await Project.findOneAndUpdate({
          wedding_name : weddingName,
          Mobile_Number : mobile_no,
          Package : packages
        } , {
          $setOnInsert : {wedding_name: weddingName , Mobile_Number : mobile_no}
        } , {
          upsert : true , new : true
        })
        console.log(project);
      }catch(error){
        console.error('Project creation error:', error);
        return res.status(500).json({ success: false, error: 'Failed to create/find project' });
      }

      // extracting leaf folder names fro file path.
      const filePaths = files.map(f => f.relativePath);                             // weddingId = project._id
      const createdCategories = await createCategoriesFromPaths(filePaths , Category , project._id);

      // Insert all created category ObjectIds into the Project's categories array (required by project schema)
      if (createdCategories && createdCategories.length > 0) {
        const categoryIds = createdCategories.map(cat => cat._id);
        try {
          await Project.findByIdAndUpdate(
            project._id,
            { $addToSet: { categories: { $each: categoryIds } } },
            { new: true }
          );
        } catch (err) {
          console.error('Failed to update Project with categoryIds:', err);
        }
      }

      // for quick lookup we creating a map for categories and their id (this will be helpful during image push in category.);
      const categoryMap = {};
      createdCategories.forEach(cat => {
        categoryMap[cat.title] = cat._id;
      })


    // Process files with enhanced folder structure preservation
    const urlPromises = files.map(async (fileInfo, index) => {
      try {
        // Validate file
        const sanitizedFileName = validateFile(fileInfo);

        // Extract folder path from relativePath if available 
        let originalPath = '';
        let folderPath = generateFolderPath(root_folder_name);
        
        if (preserveFolderStructure && fileInfo.relativePath) {
          // Handle folder structure from drag & drop
          originalPath = fileInfo.relativePath.includes('/') ? 
            path.dirname(fileInfo.relativePath) : '';
          
          if (originalPath && originalPath !== '.') {
            // Use the same baseUploadId for all files to maintain folder structure
            folderPath = generateFolderPath(root_folder_name, originalPath, baseUploadId);
          } else {
            // For files in root, use the base folder with baseUploadId
            folderPath = `uploads/${root_folder_name}/${baseUploadId}`;
          }
        } else {
          // For non-folder uploads, use the base folder with baseUploadId
          folderPath = `uploads/${root_folder_name}/${baseUploadId}`;
        }


        /* so i am creating the category usign the folder structure somewhere here
          using the end node name from the original file path.
        */
          let leafFolder = '';
          if(originalPath){
            const parts = originalPath.split('/');
            leafFolder = parts[parts.length - 1];
          }else {
            leafFolder = 'root'; // you can put the name of the main folder.
          }

          const categoryObjectId = categoryMap[leafFolder];


        // Generate unique filename to prevent conflicts 
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
            'x-amz-meta-category-id': categoryObjectId ? categoryObjectId.toString() : 'categoryId',
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

          // main yeh 2 hai
          categoryId: categoryObjectId ? categoryObjectId.toString() : undefined,
          weddingId: project._id,
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

    // Separate successful and failed generations
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    // Enhanced logging
    console.log(`Pre-signed URL generation completed: ${successful.length} successful, ${failed.length} failed`);

    // Return comprehensive response
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
      files, // Array of completed file info: [{ key, originalName, finalUrl, status, size, etag, folderPath, weddingId , categoryId }]
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

    // Store image details and URLs in MongoDB for successful files
    let insertedImages = [];
    if (successfulFiles.length > 0) {

      // Ensure ObjectId types for categoryId and weddingId (ESM compatible)
      const imageDocs = successfulFiles.map((file, idx) => {
        let categoryId = file.categoryId;
        let weddingId = file.weddingId;
        // Convert to ObjectId if string, or throw if invalid
        if (categoryId && !(categoryId instanceof mongoose.Types.ObjectId)) {
          if (typeof categoryId === 'string' && categoryId.match(/^[a-fA-F0-9]{24}$/)) {
            categoryId = new mongoose.Types.ObjectId(categoryId);
          } else {
            console.error('Invalid categoryId for image', idx, categoryId, typeof categoryId);
            throw new Error('Invalid categoryId for image: ' + JSON.stringify(file));
          }
        }
        if (weddingId && !(weddingId instanceof mongoose.Types.ObjectId)) {
          if (typeof weddingId === 'string' && weddingId.match(/^[a-fA-F0-9]{24}$/)) {
            weddingId = new mongoose.Types.ObjectId(weddingId);
          } else {
            console.error('Invalid weddingId for image', idx, weddingId, typeof weddingId);
            throw new Error('Invalid weddingId for image: ' + JSON.stringify(file));
          }
        }
        return {
          key: file.key,
          categoryId: categoryId,
          weddingId: weddingId,
          folderPath: file.folderPath,
          originalName: file.originalName,
          size: file.actualSize || file.size,
          uploadedAt: file.lastModified ? new Date(file.lastModified) : new Date(),
        };
      });
      // Log for debugging
      imageDocs.forEach((img, idx) => {
        if (!(img.categoryId instanceof mongoose.Types.ObjectId)) {
          console.error('categoryId is not ObjectId at', idx, img.categoryId, typeof img.categoryId);
        }
        if (!(img.weddingId instanceof mongoose.Types.ObjectId)) {
          console.error('weddingId is not ObjectId at', idx, img.weddingId, typeof img.weddingId);
        }
      });
      // Insert images and get the inserted docs (with _id)
      insertedImages = await Image.insertMany(imageDocs);

      // Efficiently push each image's ObjectId into the images array of its corresponding Category
      // Use $addToSet to avoid duplicates
      const categoryUpdates = {};
      insertedImages.forEach(img => {
        if (!img.categoryId) return;
        const catId = img.categoryId.toString();
        if (!categoryUpdates[catId]) categoryUpdates[catId] = [];
        categoryUpdates[catId].push(img._id);
      });

      // Perform bulk update for all categories
      const bulkOps = Object.entries(categoryUpdates).map(([catId, imageIds]) => ({
        updateOne: {
          filter: { _id: catId },
          update: { $addToSet: { images: { $each: imageIds } } }
        }
      }));
      if (bulkOps.length > 0) {
        await Category.bulkWrite(bulkOps);
      }
    }

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

