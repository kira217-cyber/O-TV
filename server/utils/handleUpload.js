import { errorResponse } from "./response.js";

// Wraps a multer middleware (e.g. upload.single("logo")) so file-size/
// file-type rejections come back as a clean 400 instead of falling
// through to the generic 500 error handler.
export const handleUpload = (multerMiddleware) => (req, res, next) => {
  multerMiddleware(req, res, (err) => {
    if (err) {
      return errorResponse(res, err.message, 400);
    }

    next();
  });
};

export default handleUpload;
