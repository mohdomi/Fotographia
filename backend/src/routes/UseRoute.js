import Router from "express"

import Userauthmiddleware from "../middleware/user-auth-md.js";
import { Userlogin,GetImages ,getUser,addAccess} from "../controllers/User-controller.js";
const route= Router();

route.post("/signin",Userlogin);
route.patch("/addmembers/:userId",Userauthmiddleware,addAccess);
route.get("/me",Userauthmiddleware,getUser);
route.get("/images",Userauthmiddleware,GetImages);


const UserRoute=route;

export default UserRoute;