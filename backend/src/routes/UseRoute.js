import Router from "express"

import Userauthmiddleware from "../middleware/user-auth-md.js";
import { Userlogin,GetImages } from "../controllers/User-controller.js";
const route= Router();

route.post("/signin",Userlogin);
route.get("/images",Userauthmiddleware,GetImages);

const UserRoute=route;

export default UserRoute;