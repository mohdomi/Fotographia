import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import validatePassword from '../utils/ValidatePass.js';
import { calculateCountdownDuration } from '../utils/countdownUtils.js';

import Projects from '../db/schema/project.schema.js';
import User from '../db/schema/user.js';



export const AdminSignup =  async(req,res,next)=>{

         const {password}=req.body;

if(validatePassword(password)){

const user = await User.create({
     password,
     role:"admin",
});



 res.json({
    user:user
});
next();

}else{
    return res.json({
        message:"weak password"
    });
}

}

 export const AdminSignin = async (req,res,next)=>{
    const {password}=req.body;
    if(!password){
        return res.json({
            message:"password is required"
        });
    }

   const AdminUser=await User.findOne({
    password:password
   });

   if(!AdminUser) return res.json({message:"Admin doesn't exist"});
   
   const token=jwt.sign({role:AdminUser.role},"sachinjha"); 

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000 // 1 day
});


res.json({
    user:AdminUser,
    message:"Admin loggedin successfully"
})
next();
}





export const createProject = async (req, res) => {
  try {
    const {
      wedding_name,
      dueDate,
      estimatedDays,
      Mobile_Number,
      Userpin,
    } = req.body;

    if(!validatePassword(Userpin)) return res.json({message:"weak Password"});

    //countdown in months days hours minutes
    const { months, days, hours, minutes } = calculateCountdownDuration(dueDate, estimatedDays);

    // Save to database
    const newProject = new Projects({
      wedding_name,
       Date:dueDate,
      Mobile_Number,
      Userpin,
      months,
      days,
      hours,
      minutes
      
    });

    const saved = await newProject.save();

    res.status(201).json({
      message: "Project created with countdown",
      data: saved
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating project",
      error: error.message
    });
  }
};
