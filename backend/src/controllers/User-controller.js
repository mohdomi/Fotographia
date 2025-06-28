import Projects from "../db/schema/project.schema.js"
import ClientUser from "../db/schema/user.schema.js";
import User from "../db/schema/user.schema.js"
import jwt from 'jsonwebtoken'


export const Userlogin = async(req,res)=>{
    const {pin}=req.body;

    const validuser= await ClientUser.findOne({
        Userpin:pin,
    });
console.log(validuser);
    if(!validuser) return res.json({message:"Invalid pin"});
   
  
    const token=jwt.sign({id:validuser._id},"secret");
    res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000 // 1 day

});

res.json({
    message:"Welcome in fotographia"
});
}


export const GetImages=async(req,res)=>{
const id=await req.id;
console.log(id);

const user= await User.findOne({
    _id:id
});

//console.log(user);

const project=await Projects.findOne({
       _id:user.weddingId
});


const imgMap = project.wedding_img[0];

let haldi = [];
let mehndi = [];
let wedding = [];

if (imgMap instanceof Map) {

  // When it's actually a Map
  haldi = imgMap.get("haldi") || [];
  mehndi = imgMap.get("mehndi") || [];
  wedding = imgMap.get("wedding") || [];
  
} else if (typeof imgMap === "object") {
  // When it's serialized to a plain object
  haldi = imgMap?.haldi || [];
  mehndi = imgMap?.mehndi || [];
  wedding = imgMap?.wedding || [];
}

console.log("Haldi images:", haldi);


res.json({
   project,
   imgMap
});

}