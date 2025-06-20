import Router from "express"
import {AdminSignup,AdminSignin,createProject} from "../controllers/Admin-auth.js"
import authmiddleware  from "../middleware/Auth-middleware.js";
const route= Router();

//route.post("/admsignup",AdminSignup);

route.post("/admsignin",AdminSignin);
route.post("/create-project",authmiddleware,createProject);

const AdminRoute=route;

export default AdminRoute;