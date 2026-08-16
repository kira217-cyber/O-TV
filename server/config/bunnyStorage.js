// Bunny.net Edge Storage integration for raw video/trailer files.
// The AccessKey lives only in server env vars and is never sent to clients.
//
// Env vars are read lazily (inside functions) rather than cached at module
// load time: ES module imports are hoisted and run before index.js's
// dotenv.config() call, so top-level `process.env.X` reads here would
// always see undefined.
import https from "https";

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

// `onProgress(percent)` is optional — passed by upload routes that want to
// relay live progress to a polling client (see server/utils/uploadProgress.js).
//
// Uploads via raw `https.request` in fixed-size chunks, waiting for the
// socket's `drain` event before writing the next one, rather than handing
// the whole buffer to a single `write()`/fetch body. Node buffers a large
// write internally and reports it "sent" almost instantly regardless of
// real network throughput (confirmed: axios/fetch progress on a Buffer body
// fired 0% then 100% within ~70ms even for a 300MB upload that took over a
// minute to actually finish) — `drain` only fires once the kernel socket
// buffer has actually flushed, so pacing chunks off it reflects genuine
// upload progress instead of a false-positive instant 100%.
export const uploadToBunny = (buffer, fileName, contentType, onProgress) =>
  new Promise((resolve, reject) => {
    const { accessKey } = config();

    if (!accessKey) {
      reject(
        new Error(
          "Bunny storage is not configured (missing BUNNY_STORAGE_ACCESS_KEY)",
        ),
      );
      return;
    }

    const target = new URL(buildStorageUrl(fileName));
    const CHUNK_SIZE = 1024 * 1024; // 1MB

    const req = https.request(
      {
        hostname: target.hostname,
        path: `${target.pathname}${target.search}`,
        method: "PUT",
        headers: {
          AccessKey: accessKey,
          "Content-Type": contentType || "application/octet-stream",
          "Content-Length": buffer.length,
        },
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => {
          body += chunk;
        });
        res.on("end", () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            onProgress?.(100);
            resolve(getBunnyCdnUrl(fileName));
          } else {
            reject(
              new Error(
                `Bunny storage upload failed (${res.statusCode}): ${body || res.statusMessage}`,
              ),
            );
          }
        });
      },
    );

    req.on("error", (error) =>
      reject(new Error(`Bunny storage upload failed: ${error.message}`)),
    );

    let offset = 0;

    const writeNextChunk = () => {
      if (offset >= buffer.length) {
        req.end();
        return;
      }

      const chunk = buffer.subarray(offset, Math.min(offset + CHUNK_SIZE, buffer.length));
      offset += chunk.length;

      const ok = req.write(chunk);
      onProgress?.(Math.min(99, Math.round((offset / buffer.length) * 100)));

      if (ok) {
        setImmediate(writeNextChunk);
      } else {
        req.once("drain", writeNextChunk);
      }
    };

    if (buffer.length === 0) {
      req.end();
    } else {
      writeNextChunk();
    }
  });

// Best-effort cleanup — callers never await this to fail the request over
// it (e.g. during a video delete/replace), but "best-effort" must still
// mean "we'd know if it didn't work": `fetch` only rejects on a
// network-level failure, not on a non-2xx response, so a bad/expired
// AccessKey, wrong storage zone/folder, or a transient Bunny 5xx would
// previously resolve exactly like a real success and leave the file
// orphaned on Bunny forever with zero trace anywhere. Every failure path
// here is now logged so an orphan is at least visible in the server logs
// instead of silently accumulating storage cost.
export const deleteFromBunny = async (fileName) => {
  const { accessKey } = config();

  if (!fileName) return;
  if (!accessKey) {
    console.error(
      `Bunny delete skipped for ${fileName}: BUNNY_STORAGE_ACCESS_KEY is not configured`,
    );
    return;
  }

  try {
    const res = await fetch(buildStorageUrl(fileName), {
      method: "DELETE",
      headers: { AccessKey: accessKey },
    });

    // 404 just means it's already gone (or never existed) — that's the
    // desired end state, not a failure.
    if (!res.ok && res.status !== 404) {
      const body = await res.text().catch(() => "");
      console.error(
        `Bunny delete failed for ${fileName}: ${res.status} ${res.statusText}${body ? ` — ${body}` : ""}`,
      );
    }
  } catch (error) {
    console.error(`Bunny delete errored for ${fileName}: ${error.message}`);
  }
};
