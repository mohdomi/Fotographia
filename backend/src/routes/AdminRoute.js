import Router from "express"
import {AdminSignup,AdminSignin,createProject} from "../controllers/Admin-auth.js"
import authmiddleware  from "../middleware/Auth-middleware.js";
import upload from "../utils/multer.js";
import { mainUploadMethod , setUploadProvider } from "../controllers/uploadToCloudinary.js";

const route= Router();

//route.post("/admsignup",AdminSignup);

route.post("/admsignin",AdminSignin);
route.post("/create-project",authmiddleware,createProject);

// logic for file/folder upload.
route.post("/upload-folder" , upload.array('images' , 100) , mainUploadMethod);

// this route is just created for specifically toggling between aws s3 and cloudinary in future can be deleted or modified for more storage options.
// so i have kept this temporarily.
route.post("/set-upload-provider" , setUploadProvider);

const AdminRoute=route;

export default AdminRoute;