import express from "express"
import dotenv from 'dotenv';
const app = express();
dotenv.config();
app.use(express.json());


app.get("/",(req,res)=>{
  res.send("Hello I am a Sachin , omair , oves");
})
app.listen(process.env.PORT,()=>{
    console.log("app is listening on port:http://localhost:8080");
})