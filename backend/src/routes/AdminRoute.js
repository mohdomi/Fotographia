import Router from "express"
import {AdminSignup,AdminSignin,createProject} from "../controllers/Admin-auth.js"
import authmiddleware  from "../middleware/Auth-middleware.js";
import {generatePresignedUrls,
  handleUploadComplete,
  getUploadStatus,
  setUploadProvider,
  deleteUploadedFiles} from '../controllers/uploadS3controller.js'

const route= Router();

route.post("/admsignup",AdminSignup);

route.post("/admsignin",AdminSignin);
route.post("/create-project",authmiddleware,createProject);

// this route is just created for specifically toggling between aws s3 and cloudinary in future can be deleted or modified for more storage options.
// so i have kept this temporarily.
route.post('/set-upload-provider', setUploadProvider);

// Generate pre-signed URLs for direct upload
route.post('/generate-upload-urls', generatePresignedUrls);

// Handle upload completion webhook  
route.post('/upload-complete', handleUploadComplete);

// Get upload session status
route.get('/upload-status/:uploadSessionId', getUploadStatus);

// Set upload provider

// Delete uploaded files
route.delete('/delete-files', deleteUploadedFiles);

const AdminRoute=route;

export default AdminRoute;