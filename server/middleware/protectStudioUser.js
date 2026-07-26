import jwt from "jsonwebtoken";
import StudioUser from "../models/StudioUser.js";
import { errorResponse } from "../utils/response.js";

export const protectStudioUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return errorResponse(res, "Not authorized, no token", 401);
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await StudioUser.findById(decoded.id).select("-password");

    if (!user) {
      return errorResponse(res, "Not authorized, user not found", 401);
    }

    if (
      typeof decoded.tokenVersion === "number" &&
      decoded.tokenVersion !== (user.tokenVersion || 0)
    ) {
      return errorResponse(res, "Session expired, please login again", 401);
    }

    if (user.status === "inactive") {
      return errorResponse(
        res,
        "Your account has been deactivated by the admin",
        401,
      );
    }

    req.studioUser = user;
    next();
  } catch (error) {
    if (error?.name === "TokenExpiredError") {
      return errorResponse(res, "Session expired, please login again", 401);
    }

    return errorResponse(res, "Not authorized, token invalid", 401);
  }
};

export default protectStudioUser;
