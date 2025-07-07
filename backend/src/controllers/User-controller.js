// import Projects from "../models/project.schema.js"
// import ClientUser from "../models/user.schema.js";
// //import User from "../models/user.js"
// import jwt from 'jsonwebtoken'
// import AccessUser from "../models/AccessUser.js";

// export const Userlogin = async(req,res)=>{
//     const {pin}=req.body;

//     const validuser= await ClientUser.findOne({
//         Userpin:pin,
//     });
// //console.log(validuser);
//     if(!validuser) return res.status(400).json({message:"Invalid pin"});
   
  
//     const token=jwt.sign({id:validuser._id},"secret");
//     res.cookie("token", token, {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     sameSite: "strict",
//     maxAge: 24 * 60 * 60 * 1000 // 1 day

// });

// res.status(200).json({
//     user:validuser,
//     message:"Welcome in fotographia"
// });
// }

// export const Userlogout = async (req, res) => {
//   try {
//     // Clear the cookie (assuming cookie is named 'token')
//     res.clearCookie("token", {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production", // true in production (HTTPS)
//       sameSite: "strict",
//     });

//     res.status(200).json({ message: "Logout successful" });
//   } catch (error) {
//     res.status(500).json({ message: "Something went wrong during logout" });
//   }
// };


// export const getUser=async(req,res)=>{
//     const user =await ClientUser.findOne({
//         _id:req.id
//     })
// if(!user) return res.json({message:"user not found"});
//     return res.json({
//         user:user
//     })
// }

// export const GetImages=async(req,res)=>{
// const id=await req.id;
// console.log(id);

// const user= await ClientUser.findOne({
//     _id:id
// });

// //console.log(user);

// const project= await Projects.findOne({
//        _id:user.weddingId
// });


// const imgMap = project.wedding_img;
// console.log(imgMap);



// res.json({
//    imgMap
// });

// }


// export const addAccess = async (req, res) => {
//   const { email, role = 'viewer' } = req.body;
//   const { userId } = req.params;

//   try {
//     // Validate role
//     const validRoles = ['viewer', 'admin'];
//     if (!validRoles.includes(role)) {
//       return res.status(400).json({ message: "Invalid role. Must be 'viewer' or 'admin'." });
//     }

//     // Find the target user
//     console.log(userId);
//     const user = await ClientUser.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Check if the email is already in user's access list

//     const existingAccess = await AccessUser.findOne({ email, _id: { $in: user.accessList } });
//     if (existingAccess) {
//       return res.status(400).json({ message: "This email already has access" });
//     }

//     // Create new AccessUser entry
//     const accessUser = await AccessUser.create({
//       email,
//       role,
//       addedBy: await req.id, // assumes req.user is populated
//     });

//     // Add to user's accessList
//     await ClientUser.findByIdAndUpdate(userId, {
//       $addToSet: { Access: accessUser._id }
//     });

//     return res.status(201).json({ message: `${role} access added`, accessUser });

//   } catch (error) {
//     return res.status(500).json({
//       message: "Something went wrong while adding access",
//       error: error.message
//     });
// } 
// }

import Projects from "../models/project.schema.js";
import ClientUser from "../models/user.schema.js";
import jwt from 'jsonwebtoken';
import AccessUser from "../models/AccessUser.js";

export const Userlogin = async (req, res) => {
  try {
    const { pin } = req.body;

    const validuser = await ClientUser.findOne({
      Userpin: pin,
    });

    if (!validuser) return res.status(400).json({ message: "Invalid pin" });

    const token = jwt.sign({ id: validuser._id }, "secret");

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.status(200).json({
      user: validuser,
      message: "Welcome in fotographia",
    });
  } catch (error) {
    res.status(500).json({ message: "Login error", error: error.message });
  }
};

export const Userlogout = async (req, res) => {
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

export const getUser = async (req, res) => {
  try {
    const user = await ClientUser.findOne({
      _id: req.id,
    });

    if (!user) return res.json({ message: "user not found" });

    return res.json({
      user: user,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user", error: error.message });
  }
};

export const GetImages = async (req, res) => {
  try {
    const id = await req.id;
    console.log(id);

    const user = await ClientUser.findOne({
      _id: id,
    });

    const project = await Projects.findOne({
      _id: user.weddingId,
    });

    const imgMap = project.wedding_img;
    console.log(imgMap);

    res.json({
      imgMap,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch images", error: error.message });
  }
};

export const addAccess = async (req, res) => {
  try {
    const { email, role = 'viewer' } = req.body;
    const { userId } = req.params;

    const validRoles = ['viewer', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role. Must be 'viewer' or 'admin'." });
    }

    console.log(userId);
    const user = await ClientUser.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const existingAccess = await AccessUser.findOne({ email, _id: { $in: user.accessList } });
    if (existingAccess) {
      return res.status(400).json({ message: "This email already has access" });
    }

    const accessUser = await AccessUser.create({
      email,
      role,
      addedBy: await req.id,
    });

    await ClientUser.findByIdAndUpdate(userId, {
      $addToSet: { Access: accessUser._id },
    });

    return res.status(201).json({ message: `${role} access added`, accessUser });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong while adding access",
      error: error.message,
    });
  }
};
