import { uploadToBunny } from "../config/bunnyStorage.js";
import { buildBunnyFileName } from "./videoFiles.js";
import { setUploadProgress } from "./uploadProgress.js";

// Gives a route the storage name and URL for an uploaded media file,
// whichever way it got there.
//
// When the client declared the file size, bunnyStreamStorage already piped
// the part straight to Bunny while it was arriving and the work is done —
// this just hands back what it recorded. Otherwise the part was buffered
// the old way and is uploaded here, exactly as the routes used to do it, so
// nothing breaks for a caller that doesn't send sizes.
export const storeMediaFile = async (file, prefix, uploadId) => {
  if (file.bunnyUrl && file.bunnyFileName) {
    return { fileName: file.bunnyFileName, url: file.bunnyUrl, streamed: true };
  }

  const fileName = buildBunnyFileName(prefix, file.originalname);

  const url = await uploadToBunny(
    file.buffer,
    fileName,
    file.mimetype,
    uploadId ? (percent) => setUploadProgress(uploadId, percent) : undefined,
  );

  return { fileName, url, streamed: false };
};

export default storeMediaFile;
