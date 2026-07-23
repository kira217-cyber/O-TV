import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import { errorResponse } from "../utils/response.js";

export const protectAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return errorResponse(res, "Not authorized, no token", 401);
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const admin = await Admin.findById(decoded.id).select("-password");

    if (!admin) {
      return errorResponse(res, "Not authorized, admin not found", 401);
    }

    req.admin = admin;
    next();
  } catch (error) {
    return errorResponse(res, "Not authorized, token invalid", 401);
  }
};

export const requireMother = (req, res, next) => {
  if (req.admin?.role !== "mother") {
    return errorResponse(res, "Not authorized as mother admin", 403);
  }

  next();
};

export default protectAdmin;
