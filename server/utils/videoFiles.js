import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import crypto from "crypto";

export const MAX_THUMBNAIL_SIZE = 20 * 1024 * 1024;

// Thumbnails stay on local disk (same convention as channel logos) since
// they're small images served via the existing /uploads static route.
export const saveThumbnail = async (file) => {
  const ext = path.extname(file.originalname) || ".jpg";
  const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
  const uploadsDir = path.join(process.cwd(), "uploads");

  await fsp.mkdir(uploadsDir, { recursive: true });
  await fsp.writeFile(path.join(uploadsDir, fileName), file.buffer);

  return `/uploads/${fileName}`;
};

export const deleteLocalFile = (relativePath) => {
  if (!relativePath) return;

  const filePath = path.join(process.cwd(), relativePath.replace(/^\//, ""));

  fs.unlink(filePath, () => {
    // Ignore errors — file may already be gone.
  });
};

// Never trust the client-supplied name for the object key stored in Bunny —
// generate a fresh, collision-proof one from a random UUID instead.
export const buildBunnyFileName = (prefix, originalName) => {
  const ext = path.extname(originalName) || ".mp4";
  return `${prefix}-${Date.now()}-${crypto.randomUUID()}${ext}`;
};
