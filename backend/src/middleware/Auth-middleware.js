
import jwt from 'jsonwebtoken'
const authmiddleware = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decodedvalue = jwt.verify(token, "sachinjha");
    req.role = decodedvalue?.role;
    req.id=decodedvalue?.id;
    next();
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default authmiddleware;