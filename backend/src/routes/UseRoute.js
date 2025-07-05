import Router from "express"

import Userauthmiddleware from "../middleware/user-auth-md.js";
import { Userlogin,GetImages ,getUser,addAccess} from "../controllers/User-controller.js";
import {   getWeddingImagesWithPresignedUrls } from "../controllers/fetchS3controller.js";
const route= Router();

route.post("/signin",Userlogin);
route.patch("/addmembers/:userId",Userauthmiddleware,addAccess);
route.get("/me",Userauthmiddleware,getUser);
route.get("/images",Userauthmiddleware,GetImages); // sachin's implementation
route.post("/fetch_presigned_urls", getWeddingImagesWithPresignedUrls);




const UserRoute=route;

export default UserRoute;