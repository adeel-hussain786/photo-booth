import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// All gallery assets live under this prefix in Cloudinary.
const ROOT = "memorify";

// Signed display URLs are valid for this long (seconds). The customer's
// browser loads images while the gallery tab is open; 1 hour is plenty.
const DISPLAY_TTL = 60 * 60;
// Download links are short-lived so a copied URL stops working quickly.
const DOWNLOAD_TTL = 5 * 60;

/**
 * Returns true only when all three Cloudinary credentials are present.
 * Used to fail fast with a clear message instead of an opaque 401 from Cloudinary.
 */
export function cloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

/**
 * Upload a single file buffer to Cloudinary as an `authenticated` asset.
 * Authenticated assets are NOT reachable by their plain URL — every request
 * must carry a valid signature, which is what makes the gallery truly private.
 *
 * @param {Buffer} buffer       raw file bytes (from multer memoryStorage)
 * @param {string} folderId     gallery id, becomes the Cloudinary sub-folder
 * @param {string} originalName used to derive a readable public_id
 * @returns {Promise<object>}   Cloudinary upload result
 */
export function uploadBuffer(buffer, folderId, originalName) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `${ROOT}/${folderId}`,
        resource_type: "auto", // image or video, detected automatically
        type: "authenticated", // requires a signature to be delivered
        use_filename: true,
        unique_filename: true,
        // Strip the original filename's extension; Cloudinary stores format separately.
        filename_override: originalName,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(buffer);
  });
}

/**
 * Build a short-lived, signed URL that an <img>/<video> tag can render.
 * Without the signature the asset returns 401, so these URLs are the only
 * way to view the media.
 */
export function signedDisplayUrl(publicId, resourceType, format) {
  return cloudinary.url(publicId, {
    resource_type: resourceType,
    type: "authenticated",
    format,
    sign_url: true,
    secure: true,
    // Expiring URLs require the signed-URL/auth-token feature on the Cloudinary
    // plan. expires_at is honored when available; the signature alone already
    // prevents anonymous access.
    expires_at: Math.floor(Date.now() / 1000) + DISPLAY_TTL,
  });
}

/**
 * Build a signed URL that forces a file download (fl_attachment) rather than
 * inline display. Used for the per-image "Download" buttons.
 */
export function signedDownloadUrl(publicId, resourceType, format, attachmentName) {
  return cloudinary.utils.private_download_url(publicId, format, {
    resource_type: resourceType,
    type: "authenticated",
    expires_at: Math.floor(Date.now() / 1000) + DOWNLOAD_TTL,
    attachment: attachmentName || true,
  });
}

/**
 * Permanently delete every asset belonging to a gallery, then remove the
 * now-empty Cloudinary folder. Best-effort: a failure to delete the folder
 * shell (e.g. it never existed) is swallowed so callers don't crash.
 */
export async function deleteGallery(folderId) {
  const prefix = `${ROOT}/${folderId}`;
  for (const resource_type of ["image", "video"]) {
    try {
      await cloudinary.api.delete_resources_by_prefix(prefix, {
        resource_type,
        type: "authenticated",
      });
    } catch (err) {
      console.error(`Cloudinary delete (${resource_type}) failed for ${prefix}:`, err.message);
    }
  }
  try {
    await cloudinary.api.delete_folder(prefix);
  } catch {
    // Folder may already be gone — ignore.
  }
}

export default cloudinary;
