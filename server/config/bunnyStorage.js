// Bunny.net Edge Storage integration for raw video/trailer files.
// The AccessKey lives only in server env vars and is never sent to clients.
//
// Env vars are read lazily (inside functions) rather than cached at module
// load time: ES module imports are hoisted and run before index.js's
// dotenv.config() call, so top-level `process.env.X` reads here would
// always see undefined.
const config = () => ({
  storageHost: process.env.BUNNY_STORAGE_HOST || "sg.storage.bunnycdn.com",
  storageZone: process.env.BUNNY_STORAGE_ZONE || "oracle-store",
  storageFolder: process.env.BUNNY_STORAGE_FOLDER || "Opay",
  cdnHostname: process.env.BUNNY_CDN_HOSTNAME || "oracle-store.b-cdn.net",
  accessKey: process.env.BUNNY_STORAGE_ACCESS_KEY,
});

// Each path segment is encoded separately — encoding the whole URL at once
// would double-encode the already-safe zone/folder segments.
const buildStorageUrl = (fileName) => {
  const { storageHost, storageZone, storageFolder } = config();
  return `https://${storageHost}/${encodeURIComponent(storageZone)}/${encodeURIComponent(storageFolder)}/${encodeURIComponent(fileName)}`;
};

export const getBunnyCdnUrl = (fileName) => {
  const { cdnHostname, storageFolder } = config();
  return `https://${cdnHostname}/${encodeURIComponent(storageFolder)}/${encodeURIComponent(fileName)}`;
};

export const uploadToBunny = async (buffer, fileName, contentType) => {
  const { accessKey } = config();

  if (!accessKey) {
    throw new Error(
      "Bunny storage is not configured (missing BUNNY_STORAGE_ACCESS_KEY)",
    );
  }

  const response = await fetch(buildStorageUrl(fileName), {
    method: "PUT",
    headers: {
      AccessKey: accessKey,
      "Content-Type": contentType || "application/octet-stream",
    },
    body: buffer,
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `Bunny storage upload failed (${response.status}): ${detail || response.statusText}`,
    );
  }

  return getBunnyCdnUrl(fileName);
};

export const deleteFromBunny = async (fileName) => {
  const { accessKey } = config();
  if (!fileName || !accessKey) return;

  try {
    await fetch(buildStorageUrl(fileName), {
      method: "DELETE",
      headers: { AccessKey: accessKey },
    });
  } catch {
    // Best-effort cleanup — an orphaned remote file is not worth failing
    // the request over (e.g. during a video delete/replace).
  }
};
