import express from "express"
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser'
import AdminRoute from "./src/routes/AdminRoute.js";
import { MongoDB } from "./src/db/index.db.js";
import authmiddleware from "./src/middleware/Auth-middleware.js";
import UserRoute from "./src/routes/UseRoute.js";
import mongoose from "mongoose";
const app = express();
dotenv.config();
app.use(express.json());

mongoose.connect("mongodb://localhost:27017/WeddingPhotos")
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });



app.use(cookieParser());
app.use("/api/v1/admin",AdminRoute);
app.use("/api/v1/user",UserRoute);

app.get("/hello",authmiddleware,(req,res)=>{
  res.json({
    role:req.role
  });
});

app.listen(process.env.PORT,()=>{
    console.log("app is listening on port:http://localhost:8080");
})