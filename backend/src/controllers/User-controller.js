import Projects from "../db/schema/project.schema.js"
import User from "../db/schema/user.schema.js"
import jwt from 'jsonwebtoken'


export const Userlogin = async(req,res)=>{
    const {pin}=req.body;

    const validuser=await Projects.findOne({
        Userpin:pin,
    });
console.log(validuser)
    if(!validuser) return res.json({message:"Invalid pin"});
   
    const user=await User.create({
        Userpin:pin
    });
  
    const token=jwt.sign({id:user._id},"secret");
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
console.log(user);
const project=await Projects.findOne({
    Userpin:user?.Userpin
});


const image=project.wedding_img;
console.log(image);
res.json({
   project
});

}