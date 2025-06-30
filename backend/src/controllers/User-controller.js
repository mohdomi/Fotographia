import Projects from "../db/schema/project.schema.js"
import ClientUser from "../db/schema/user.schema.js";
import User from "../db/schema/user.schema.js"
import jwt from 'jsonwebtoken'
import AccessUser from "../db/schema/AccessUser.js";

export const Userlogin = async(req,res)=>{
    const {pin}=req.body;

    const validuser= await ClientUser.findOne({
        Userpin:pin,
    });
//console.log(validuser);
    if(!validuser) return res.json({message:"Invalid pin"});
   
  
    const token=jwt.sign({id:validuser._id},"secret");
    res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000 // 1 day

});

res.json({
    user:validuser,
    message:"Welcome in fotographia"
});
}

export const getUser=async(req,res)=>{
    const user =await User.findOne({
        _id:req.id
    })
if(!user) return res.json({message:"user not found"});
    return res.json({
        user:user
    })
}

export const GetImages=async(req,res)=>{
const id=await req.id;
console.log(id);

const user= await User.findOne({
    _id:id
});

//console.log(user);

const project= await Projects.findOne({
       _id:user.weddingId
});


const imgMap = project.wedding_img;
console.log(imgMap);



res.json({
   imgMap
});

}


export const addAccess = async (req, res) => {
  const { email, role = 'viewer' } = req.body;
  const { userId } = req.params;

  try {
    // Validate role
    const validRoles = ['viewer', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role. Must be 'viewer' or 'admin'." });
    }

    // Find the target user
    console.log(userId);
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the email is already in user's access list

    const existingAccess = await AccessUser.findOne({ email, _id: { $in: user.accessList } });
    if (existingAccess) {
      return res.status(400).json({ message: "This email already has access" });
    }

    // Create new AccessUser entry
    const accessUser = await AccessUser.create({
      email,
      role,
      addedBy: await req.id, // assumes req.user is populated
    });

    // Add to user's accessList
    await User.findByIdAndUpdate(userId, {
      $addToSet: { Access: accessUser._id }
    });

    return res.status(201).json({ message: `${role} access added`, accessUser });

  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong while adding access",
      error: error.message
    });
} 
}