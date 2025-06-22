import express from "express"
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser'
import AdminRoute from "./src/routes/AdminRoute.js";
import { Mongoconnection } from "./src/db/index.db.js";
import authmiddleware from "./src/middleware/Auth-middleware.js";
import UserRoute from "./src/routes/UseRoute.js";
import cors from 'cors';

dotenv.config();
const app = express();

// mongodb connection function
Mongoconnection();

// temporary cors implementation here.
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use("/api/v1/admin",AdminRoute);
app.use("/api/v1/user",UserRoute);

app.get("/hello",authmiddleware,(req,res)=>{
  res.json({
    role:req.role
  });
});

app.get("/me" , (req,res)=>{
  res.json({
    hi : "hi there"
  })
})

app.listen(process.env.PORT,()=>{
    console.log("app is listening on port:http://localhost:8080");
})