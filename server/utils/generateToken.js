import jwt from "jsonwebtoken";

const generateToken = (payload, expiresIn = "7d") => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

export default generateToken;
