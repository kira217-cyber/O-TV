import jwt from "jsonwebtoken";
import { errorResponse } from "../utils/response.js";

const protectUser = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return errorResponse(res, "Not authorized, no token", 401);
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return errorResponse(res, "Not authorized, token invalid", 401);
  }
};

export default protectUser;
