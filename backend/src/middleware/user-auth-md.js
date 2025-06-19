import jwt from 'jsonwebtoken'

const Userauthmiddleware = async(req,res,next)=>{
      try {
      const token= await req.cookies?.token;
        if(!token){
            res.status(401).json({message:"Unauthorized"});
            return;
        }
        const decodedvalue = jwt.verify(token, "secret");
        req.id= decodedvalue?.id;
        next();
      } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
      }
}

export default Userauthmiddleware;






