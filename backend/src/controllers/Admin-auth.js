// import jwt from 'jsonwebtoken'
// import bcrypt from 'bcryptjs'
// import validatePassword from '../utils/ValidatePass.js';
// import { calculateCountdownDuration } from '../utils/countdownUtils.js';

// import Projects from '../models/project.schema.js';
// import User from '../models/user.js';
// import ClientUser from '../models/user.schema.js';



// export const AdminSignup =  async(req,res)=>{

//          const {password}=req.body;

// if(validatePassword(password)){

// const user = await User.create({
//      password,
//      role:"MainAdmin",
// });



//  return res.json({
//     user:user
// });

// }else{
//     return res.json({
//         message:"weak password"
//     });
// }

// }

// export const AdminSignin = async (req,res,next)=>{
//     const {password}=req.body;
//     if(!password){
//         return res.json({
//             message:"password is required"
//         });
//     }

//    const AdminUser= await User.findOne({
//     password:password.trim()
//    }).select('role');

//    if(!AdminUser) return res.status(400).json({message:"Admin doesn't exist"});
   
//    const token=jwt.sign({role:AdminUser.role,id:AdminUser._id},"sachinjha"); 

//   res.cookie("token", token, {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     sameSite: "strict",
//     maxAge: 24 * 60 * 60 * 1000 // 1 day
// });


// return res.status(200).json({
//     user:AdminUser,
//     message:"Admin loggedin successfully"
// })
// }





// export const createProject = async (req, res) => {
//   try {
//     const id= await req.id;
//     const {
//       wedding_name,
//       dueDate,
//       estimatedDays,
//       Mobile_Number,
//       Userpin,
//       wedding_face,
//       wedding_img
//     } = req.body;

//     if(!validatePassword(Userpin)) return res.json({message:"weak Password"});

//     //countdown in months days hours minutes
//     const { months, days, hours, minutes } = calculateCountdownDuration(dueDate, estimatedDays);

//     // Save to database
//     const newProject = new Projects({
//       wedding_name,
//        Date:dueDate,
//       Mobile_Number,
//       Userpin,
//       months,
//       days,
//       hours,
//       minutes,
//       AdminUserId:id,
//       wedding_face,
//       wedding_img,
      
//     });
    
  
//   //Reflect the changes in AdminUser projects array that counts how many projects have admin
    

//    const clientUser= new ClientUser({
//       Userpin,
//       weddingId:newProject._id,
//     });
   
//     const saved = await newProject.save();
//     const savedclient = await clientUser.save();

// await User.updateMany(
//   { _id: { $in:saved.AdminUserId } },
//   { $push: { projects:saved._id } }
// );
//     res.status(201).json({
//       message: "Project created with countdown",
//       Project: saved,
//       savedclient
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: "Error creating project",
//       error: error.message
//     });
//   }
// };



import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import validatePassword from '../utils/ValidatePass.js';
import { calculateCountdownDuration } from '../utils/countdownUtils.js';

import Projects from '../models/project.schema.js';
import User from '../models/user.js';
import ClientUser from '../models/user.schema.js';

export const AdminSignup = async (req, res) => {
  try {
    const { password } = req.body;

    if (validatePassword(password)) {
      const user = await User.create({
        password,
        role: "MainAdmin",
      });

      return res.status(201).json({
        user: user
      });

    } else {
      return res.status(400).json({
        message: "weak password"
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message
    });
  }
}

export const AdminSignin = async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({
        message: "password is required"
      });
    }

    const AdminUser = await User.findOne({
      password: password.trim()
    }).select('role');

    if (!AdminUser) return res.status(400).json({ message: "Admin doesn't exist" });

    const token = jwt.sign({ role: AdminUser.role, id: AdminUser._id }, "sachinjha");

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    return res.status(200).json({
      user: AdminUser,
      message: "Admin loggedin successfully"
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message
    });
  }
}

export const Adminlogout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong during logout", error: error.message });
  }
};


export const createProject = async (req, res) => {
  try {
    const id = await req.id;
    const {
      wedding_name,
      dueDate,
      estimatedDays,
      Mobile_Number,
      Userpin,
      wedding_face,
      wedding_img
    } = req.body;

    if (!validatePassword(Userpin)) return res.status(400).json({ message: "weak Password" });

    const { months, days, hours, minutes } = calculateCountdownDuration(dueDate, estimatedDays);
 console.log(months,days,hours,minutes);
 
    const newProject = new Projects({
      wedding_name,
      Date: dueDate,
      Mobile_Number,
      Userpin,
      months,
      days,
      hours,
      minutes,
      AdminUserId: id,
      wedding_face,
      wedding_img,
    });

    const clientUser = new ClientUser({
      Userpin,
      weddingId: newProject._id,
    });

    const saved = await newProject.save();
    const savedclient = await clientUser.save();

    await User.updateMany(
      { _id: { $in: saved.AdminUserId } },
      { $push: { projects: saved._id } }
    );

    res.status(201).json({
      message: "Project created with countdown",
      Project: saved,
      savedclient
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating project",
      error: error.message
    });
  }
};

