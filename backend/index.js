import express from "express"
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser'
import AdminRoute from "./src/routes/AdminRoute.js";
import authmiddleware from "./src/middleware/Auth-middleware.js";
import UserRoute from "./src/routes/UseRoute.js";
import mongoose from "mongoose";
import cors from 'cors';


const app = express();

const allowedOrigins = ['http://localhost:5173'];
app.use(cors({
  origin: allowedOrigins,
  credentials: true 
}));

dotenv.config();
app.use(express.json());

const MongoURI = process.env.MONGO_URI

mongoose.connect(MongoURI? MongoURI : "mongodb://localhost:27017/WeddingPhotos")
  .then(() => {
    console.log("MongoDB connected");
    return;
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

app.get("/me" , (req,res)=>{
  res.json({
    hi : "hi there"
  })
})

app.listen(process.env.PORT,()=>{
    console.log("app is listening on port:http://localhost:8080");
})