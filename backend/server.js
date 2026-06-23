import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import JSZip from "jszip";
import rateLimit from "express-rate-limit";

import { initDb, runDb, getDbRow, getAllDbRows, closeDb } from "./db.js";
import { upload } from "./uploadHandler.js";
import {
  validateFolderName,
  validatePassword,
  validateDescription,
  validateUsername,
  validateAdminPassword,
} from "./validation.js";
import { startCleanupJob } from "./cleanupJob.js";
import {
  cloudinaryConfigured,
  uploadBuffer,
  signedDisplayUrl,
  signedDownloadUrl,
  deleteGallery,
  uploadPublicBuffer,
  deletePublicAsset,
  uploadOrderBuffer,
  deleteOrderImages,
} from "./cloudinary.js";

dotenv.config();

const app = express();

// ─── Middleware ───
// In production set FRONTEND_ORIGIN to your site, e.g.
//   FRONTEND_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
// When unset (local dev) all origins are allowed for convenience.
const allowedOrigins = process.env.FRONTEND_ORIGIN
  ? process.env.FRONTEND_ORIGIN.split(",").map((o) => o.trim())
  : true;
app.use(cors({ origin: allowedOrigins }));

// Trust the hosting platform's proxy so rate-limiting sees the real client IP.
app.set("trust proxy", 1);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// NOTE: media is NOT served from local disk anymore. Every asset lives in
// Cloudinary as an `authenticated` resource and is reachable only through a
// short-lived signed URL handed out after a successful password check. That
// is what satisfies the "images must not be publicly accessible" requirement.

// ─── Sessions (persisted in SQLite, with expiry) ───
const SESSION_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

async function createSession(adminId) {
  const sessionToken = uuidv4();
  const now = Date.now();
  await runDb(
    "INSERT INTO admin_sessions (id, sessionToken, adminId, createdAt, expiresAt) VALUES (?, ?, ?, ?, ?)",
    [uuidv4(), sessionToken, adminId, now, now + SESSION_TTL]
  );
  return sessionToken;
}

// Returns the session row if valid and unexpired; otherwise null (and prunes
// the expired row so the table doesn't grow unbounded).
async function getValidSession(sessionToken) {
  if (!sessionToken) return null;
  const row = await getDbRow("SELECT * FROM admin_sessions WHERE sessionToken = ?", [sessionToken]);
  if (!row) return null;
  if (row.expiresAt < Date.now()) {
    await runDb("DELETE FROM admin_sessions WHERE sessionToken = ?", [sessionToken]);
    return null;
  }
  return row;
}

async function destroySession(sessionToken) {
  await runDb("DELETE FROM admin_sessions WHERE sessionToken = ?", [sessionToken]);
}

// Used after a credential change to force every device to re-authenticate.
async function destroyAllSessionsForAdmin(adminId) {
  await runDb("DELETE FROM admin_sessions WHERE adminId = ?", [adminId]);
}

// ─── Rate limiters (brute-force protection) ───
// Lock out repeated failed logins from one IP. Successful logins don't count,
// so a legitimate admin is never blocked.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 8,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts. Please try again in 15 minutes." },
});

// Throttle gallery access-code guessing.
const galleryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many attempts. Please try again later." },
});

// ─── Admin Authentication ───
app.post("/api/admin/login", loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    const admin = await getDbRow("SELECT * FROM admin_users WHERE username = ?", [username]);

    if (!admin) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const passwordMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const sessionToken = await createSession(admin.id);
    res.json({ sessionToken, username: admin.username, message: "Login successful" });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

app.post("/api/admin/logout", async (req, res) => {
  try {
    const sessionToken =
      req.body?.sessionToken || req.headers.authorization?.replace("Bearer ", "");
    if (sessionToken) {
      await destroySession(sessionToken);
    }
    res.json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ error: "Logout failed" });
  }
});

// Middleware to check admin session (async — sessions live in the DB now).
async function adminMiddleware(req, res, next) {
  try {
    const sessionToken = req.headers.authorization?.replace("Bearer ", "");
    const session = await getValidSession(sessionToken);

    if (!session) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    req.adminId = session.adminId;
    req.sessionToken = sessionToken;
    next();
  } catch (error) {
    console.error("Auth error:", error);
    res.status(500).json({ error: "Authorization failed" });
  }
}

// ─── Admin Account ───
// Returns the logged-in admin's username (used by the dashboard header).
app.get("/api/admin/me", adminMiddleware, async (req, res) => {
  try {
    const admin = await getDbRow("SELECT username FROM admin_users WHERE id = ?", [req.adminId]);
    if (!admin) return res.status(404).json({ error: "Admin not found" });
    res.json({ username: admin.username });
  } catch (error) {
    console.error("Get account error:", error);
    res.status(500).json({ error: "Failed to load account" });
  }
});

// Change username and/or password. The current password is always required as
// a confirmation step, and changing credentials invalidates all sessions so
// any other logged-in device is signed out.
app.put("/api/admin/credentials", adminMiddleware, async (req, res) => {
  try {
    const { currentPassword, newUsername, newPassword } = req.body;

    if (!currentPassword) {
      return res.status(400).json({ error: "Current password is required" });
    }
    if (!newUsername && !newPassword) {
      return res.status(400).json({ error: "Provide a new username or password" });
    }

    const admin = await getDbRow("SELECT * FROM admin_users WHERE id = ?", [req.adminId]);
    if (!admin) return res.status(404).json({ error: "Admin not found" });

    const ok = await bcrypt.compare(currentPassword, admin.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    let username = admin.username;
    let passwordHash = admin.passwordHash;

    if (newUsername && newUsername !== admin.username) {
      const v = validateUsername(newUsername);
      if (!v.valid) return res.status(400).json({ error: v.error });

      const taken = await getDbRow(
        "SELECT id FROM admin_users WHERE username = ? AND id != ?",
        [newUsername, admin.id]
      );
      if (taken) return res.status(409).json({ error: "Username is already taken" });
      username = newUsername;
    }

    if (newPassword) {
      const v = validateAdminPassword(newPassword);
      if (!v.valid) return res.status(400).json({ error: v.error });
      passwordHash = await bcrypt.hash(newPassword, 12);
    }

    await runDb("UPDATE admin_users SET username = ?, passwordHash = ? WHERE id = ?", [
      username,
      passwordHash,
      admin.id,
    ]);

    // Force a fresh login everywhere with the new credentials.
    await destroyAllSessionsForAdmin(admin.id);

    res.json({ message: "Credentials updated. Please log in again.", username });
  } catch (error) {
    console.error("Update credentials error:", error);
    res.status(500).json({ error: "Failed to update credentials" });
  }
});

// ─── Admin Folder Management ───
app.get("/api/admin/folders", adminMiddleware, async (req, res) => {
  try {
    const folders = await getAllDbRows(
      "SELECT id, folderName, description, createdAt, expiresAt FROM folders ORDER BY createdAt DESC"
    );

    const now = Date.now();
    const foldersWithDays = folders.map((f) => ({
      ...f,
      daysUntilExpiry: Math.ceil((f.expiresAt - now) / (1000 * 60 * 60 * 24)),
    }));

    res.json(foldersWithDays);
  } catch (error) {
    console.error("Get folders error:", error);
    res.status(500).json({ error: "Failed to fetch folders" });
  }
});

app.post("/api/admin/folders", adminMiddleware, async (req, res) => {
  try {
    const { folderName, password, description } = req.body;

    // Validate inputs
    const nameValidation = validateFolderName(folderName);
    if (!nameValidation.valid) {
      return res.status(400).json({ error: nameValidation.error });
    }

    const passValidation = validatePassword(password);
    if (!passValidation.valid) {
      return res.status(400).json({ error: passValidation.error });
    }

    const descValidation = validateDescription(description);
    if (!descValidation.valid) {
      return res.status(400).json({ error: descValidation.error });
    }

    // Create folder
    const folderId = uuidv4();
    const passwordHash = await bcrypt.hash(password, 10);
    const createdAt = Date.now();
    const expiresAt = createdAt + 7 * 24 * 60 * 60 * 1000; // 7 days

    await runDb(
      "INSERT INTO folders (id, folderName, passwordHash, description, createdAt, expiresAt) VALUES (?, ?, ?, ?, ?, ?)",
      [folderId, folderName, passwordHash, description || "", createdAt, expiresAt]
    );

    // No local directories to create — assets are uploaded straight to
    // Cloudinary under the `memorify/<folderId>` prefix by the upload route.

    res.json({
      folderId,
      folderName,
      createdAt,
      expiresAt,
      message: "Folder created successfully",
    });
  } catch (error) {
    console.error("Create folder error:", error);
    res.status(500).json({ error: "Failed to create folder" });
  }
});

// Edit an existing gallery: name, description, access code, and/or expiry.
// Every field is optional — only what's provided gets updated. Leaving the
// access code blank keeps the current one.
app.put("/api/admin/folders/:folderId", adminMiddleware, async (req, res) => {
  try {
    const { folderId } = req.params;
    const { folderName, description, password, expiresAt } = req.body;

    const folder = await getDbRow("SELECT * FROM folders WHERE id = ?", [folderId]);
    if (!folder) {
      return res.status(404).json({ error: "Folder not found" });
    }

    const updates = [];
    const params = [];

    if (folderName !== undefined) {
      const v = validateFolderName(folderName);
      if (!v.valid) return res.status(400).json({ error: v.error });
      updates.push("folderName = ?");
      params.push(folderName.trim());
    }

    if (description !== undefined) {
      const v = validateDescription(description);
      if (!v.valid) return res.status(400).json({ error: v.error });
      updates.push("description = ?");
      params.push(description || "");
    }

    // Only change the access code when a non-empty new one is supplied.
    if (password) {
      const v = validatePassword(password);
      if (!v.valid) return res.status(400).json({ error: v.error });
      updates.push("passwordHash = ?");
      params.push(await bcrypt.hash(password, 10));
    }

    if (expiresAt !== undefined) {
      const ts = Number(expiresAt);
      if (!Number.isFinite(ts) || ts <= 0) {
        return res.status(400).json({ error: "Invalid expiry date" });
      }
      updates.push("expiresAt = ?");
      params.push(ts);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "Nothing to update" });
    }

    params.push(folderId);
    await runDb(`UPDATE folders SET ${updates.join(", ")} WHERE id = ?`, params);

    res.json({ message: "Gallery updated successfully" });
  } catch (error) {
    console.error("Update folder error:", error);
    res.status(500).json({ error: "Failed to update gallery" });
  }
});

app.delete("/api/admin/folders/:folderId", adminMiddleware, async (req, res) => {
  try {
    const { folderId } = req.params;

    const folder = await getDbRow("SELECT id FROM folders WHERE id = ?", [folderId]);
    if (!folder) {
      return res.status(404).json({ error: "Folder not found" });
    }

    // Remove the Cloudinary assets first so we never orphan paid storage,
    // then drop the DB rows. gallery_images cascades, but we delete explicitly
    // to stay correct even if foreign keys aren't enforced.
    await deleteGallery(folderId);
    await runDb("DELETE FROM gallery_images WHERE folderId = ?", [folderId]);
    await runDb("DELETE FROM folders WHERE id = ?", [folderId]);

    res.json({ message: "Folder deleted successfully" });
  } catch (error) {
    console.error("Delete folder error:", error);
    res.status(500).json({ error: "Failed to delete folder" });
  }
});

// ─── File Upload ───
app.post("/api/admin/upload", adminMiddleware, upload.array("files", 50), async (req, res) => {
  try {
    if (!cloudinaryConfigured()) {
      return res.status(500).json({
        error: "Cloudinary is not configured. Set CLOUDINARY_* values in .env.",
      });
    }

    const { folderId } = req.body;

    if (!folderId) {
      return res.status(400).json({ error: "Folder ID required" });
    }

    // Reject uploads to folders that don't exist (e.g. deleted/expired) so we
    // never create orphaned assets in Cloudinary.
    const folder = await getDbRow("SELECT id FROM folders WHERE id = ?", [folderId]);
    if (!folder) {
      return res.status(404).json({ error: "Folder not found" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const uploadedFiles = [];
    for (const file of req.files) {
      const result = await uploadBuffer(file.buffer, folderId, file.originalname);

      const imageId = uuidv4();
      await runDb(
        `INSERT INTO gallery_images
           (id, folderId, publicId, resourceType, format, originalName, bytes, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          imageId,
          folderId,
          result.public_id,
          result.resource_type,
          result.format || "",
          file.originalname,
          result.bytes || file.size || 0,
          Date.now(),
        ]
      );

      uploadedFiles.push({
        id: imageId,
        originalName: file.originalname,
        resourceType: result.resource_type,
        bytes: result.bytes,
        // Signed preview so the admin can immediately confirm the upload.
        url: signedDisplayUrl(result.public_id, result.resource_type, result.format),
      });
    }

    res.json({
      message: "Files uploaded successfully",
      files: uploadedFiles,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Failed to upload files" });
  }
});

// ─── Client Gallery Access ───
app.post("/api/gallery/:folderId/verify", galleryLimiter, async (req, res) => {
  try {
    const { folderId } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: "Password required" });
    }

    const folder = await getDbRow("SELECT * FROM folders WHERE id = ?", [folderId]);

    if (!folder) {
      return res.status(404).json({ error: "Folder not found" });
    }

    // Check if folder expired
    if (folder.expiresAt < Date.now()) {
      return res.status(410).json({ error: "Folder has expired" });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, folder.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // Build a fresh, signed delivery URL for every asset. These are the only
    // URLs that can render the media, and they expire — so even if a customer
    // shares the page, the links go dead shortly after.
    const rows = await getAllDbRows(
      "SELECT * FROM gallery_images WHERE folderId = ? ORDER BY createdAt ASC",
      [folderId]
    );

    const items = rows.map((row) => ({
      id: row.id,
      resourceType: row.resourceType,
      originalName: row.originalName,
      url: signedDisplayUrl(row.publicId, row.resourceType, row.format),
      downloadUrl: signedDownloadUrl(
        row.publicId,
        row.resourceType,
        row.format,
        row.originalName
      ),
    }));

    res.json({
      folderName: folder.folderName,
      description: folder.description,
      items,
    });
  } catch (error) {
    console.error("Verify password error:", error);
    res.status(500).json({ error: "Failed to verify password" });
  }
});

app.post("/api/gallery/:folderId/download", galleryLimiter, async (req, res) => {
  try {
    const { folderId } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: "Password required" });
    }

    const folder = await getDbRow("SELECT * FROM folders WHERE id = ?", [folderId]);

    if (!folder) {
      return res.status(404).json({ error: "Folder not found" });
    }

    // Expired galleries can't be downloaded either (mirrors the verify route).
    if (folder.expiresAt < Date.now()) {
      return res.status(410).json({ error: "Gallery has expired" });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, folder.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const rows = await getAllDbRows(
      "SELECT * FROM gallery_images WHERE folderId = ? ORDER BY createdAt ASC",
      [folderId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Gallery has no media to download" });
    }

    // The ZIP is built in memory, so guard against OOM on very large galleries.
    // Beyond the cap, ask the customer to use the per-file download buttons.
    const MAX_ZIP_BYTES = 500 * 1024 * 1024; // 500 MB
    const totalBytes = rows.reduce((sum, r) => sum + (r.bytes || 0), 0);
    if (totalBytes > MAX_ZIP_BYTES) {
      return res.status(413).json({
        error:
          "This gallery is too large to download as a single ZIP. Please download photos individually.",
      });
    }

    // Pull every asset back from Cloudinary (via its signed URL) and stream it
    // into the ZIP. We number the entries to guarantee unique names even when
    // two originals share a filename.
    const zip = new JSZip();
    let index = 0;
    let failed = 0;
    for (const row of rows) {
      index += 1;
      const url = signedDisplayUrl(row.publicId, row.resourceType, row.format);
      const response = await fetch(url);
      if (!response.ok) {
        console.error(`Failed to fetch ${row.publicId} for ZIP: ${response.status}`);
        failed += 1;
        continue;
      }
      const buffer = Buffer.from(await response.arrayBuffer());

      const subfolder = row.resourceType === "video" ? "videos" : "images";
      const ext = row.format ? `.${row.format}` : "";
      const base = (row.originalName || `file_${index}`).replace(/\.[^.]+$/, "");
      const safeName = `${String(index).padStart(3, "0")}_${base}${ext}`;
      zip.folder(subfolder).file(safeName, buffer);
    }

    // If every asset failed to fetch, don't hand back an empty ZIP.
    if (failed === rows.length) {
      return res.status(502).json({ error: "Could not retrieve gallery media" });
    }

    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

    res.set({
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${folder.folderName}_${Date.now()}.zip"`,
    });
    res.send(zipBuffer);
  } catch (error) {
    console.error("Download ZIP error:", error);
    res.status(500).json({ error: "Failed to generate ZIP" });
  }
});

// ─── Public Website Gallery (the marketing /gallery page) ───

// Public: list the admin-added portfolio images (no auth — everyone sees these).
app.get("/api/site-gallery", async (req, res) => {
  try {
    const rows = await getAllDbRows(
      "SELECT id, url, originalName, createdAt FROM site_gallery_images ORDER BY createdAt DESC"
    );
    res.json(rows);
  } catch (error) {
    console.error("Site gallery list error:", error);
    res.status(500).json({ error: "Failed to load gallery" });
  }
});

// Admin: add one or more public portfolio images.
app.post("/api/admin/site-gallery", adminMiddleware, upload.array("files", 50), async (req, res) => {
  try {
    if (!cloudinaryConfigured()) {
      return res.status(500).json({ error: "Cloudinary is not configured." });
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const added = [];
    for (const file of req.files) {
      if (!file.mimetype.startsWith("image/")) continue; // portfolio is images only
      const result = await uploadPublicBuffer(file.buffer, file.originalname);
      const id = uuidv4();
      await runDb(
        "INSERT INTO site_gallery_images (id, publicId, url, originalName, createdAt) VALUES (?, ?, ?, ?, ?)",
        [id, result.public_id, result.secure_url, file.originalname, Date.now()]
      );
      added.push({ id, url: result.secure_url, originalName: file.originalname });
    }

    if (added.length === 0) {
      return res.status(400).json({ error: "No valid images uploaded" });
    }

    res.json({ message: "Images added", images: added });
  } catch (error) {
    console.error("Site gallery upload error:", error);
    res.status(500).json({ error: "Failed to add images" });
  }
});

// Admin: delete one public portfolio image.
app.delete("/api/admin/site-gallery/:id", adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const row = await getDbRow("SELECT * FROM site_gallery_images WHERE id = ?", [id]);
    if (!row) {
      return res.status(404).json({ error: "Image not found" });
    }
    await deletePublicAsset(row.publicId);
    await runDb("DELETE FROM site_gallery_images WHERE id = ?", [id]);
    res.json({ message: "Image deleted" });
  } catch (error) {
    console.error("Site gallery delete error:", error);
    res.status(500).json({ error: "Failed to delete image" });
  }
});

// ─── Store: products & orders ───

const orderLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many orders from this device. Please try again later." },
});

// Helper: load an order with its line items and images (used by admin views).
async function loadOrderFull(order) {
  const items = await getAllDbRows(
    "SELECT * FROM order_items WHERE orderId = ?",
    [order.id]
  );
  const images = await getAllDbRows(
    "SELECT id, orderItemId, url, slot FROM order_images WHERE orderId = ?",
    [order.id]
  );
  return {
    ...order,
    items: items.map((it) => ({
      ...it,
      images: images
        .filter((img) => img.orderItemId === it.id)
        .map((img) => ({ url: img.url, slot: img.slot })),
    })),
  };
}

// Email the business a summary of a new order (best-effort).
async function sendOrderEmail(order, items) {
  if (!process.env.EMAIL || !process.env.PASSWORD) return;
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL, pass: process.env.PASSWORD },
    });
    const lines = items
      .map(
        (li) =>
          `<li><b>${escapeHtml(li.product.name)}</b> × ${li.qty} — ${li.images.length} photo(s)</li>`
      )
      .join("");
    await transporter.sendMail({
      from: `"Memorify Store" <${process.env.EMAIL}>`,
      to: process.env.EMAIL,
      subject: `New Store Order — ${order.customerName}`,
      html: `
        <h2>New Product Order</h2>
        <p><b>Name:</b> ${escapeHtml(order.customerName)}</p>
        <p><b>Email:</b> ${escapeHtml(order.email)}</p>
        <p><b>Phone:</b> ${escapeHtml(order.phone)}</p>
        <p><b>Address:</b> ${escapeHtml(order.address)}</p>
        <p><b>Delivery:</b> ${escapeHtml(order.deliveryMethod)}</p>
        <p><b>Notes:</b> ${escapeHtml(order.notes)}</p>
        <hr/>
        <ul>${lines}</ul>
        <p><b>Total:</b> ${order.total}</p>
        <p>View full order (with photos) in the admin dashboard.</p>
      `,
    });
  } catch (err) {
    console.error("Order email failed:", err.message);
  }
}

// Public: list products available for ordering.
app.get("/api/products", async (req, res) => {
  try {
    const rows = await getAllDbRows(
      "SELECT productKey, name, price, description, imageUrl, photoMode, unitCount FROM products WHERE active = 1 ORDER BY sortOrder ASC, name ASC"
    );
    res.json(rows);
  } catch (error) {
    console.error("List products error:", error);
    res.status(500).json({ error: "Failed to load products" });
  }
});

// Public: place an order. Multipart form:
//   customer = JSON { name, email, phone, address, notes }
//   items    = JSON [ { productKey, quantity }, ... ]
//   files    = images named item_<index> (multiple per item allowed)
app.post("/api/orders", orderLimiter, upload.any(), async (req, res) => {
  try {
    if (!cloudinaryConfigured()) {
      return res.status(500).json({ error: "Store is not configured for uploads." });
    }

    let customer, items;
    try {
      customer = JSON.parse(req.body.customer || "{}");
      items = JSON.parse(req.body.items || "[]");
    } catch {
      return res.status(400).json({ error: "Invalid order data" });
    }

    // Accept either separate first/last names or a combined name.
    const customerName =
      [customer.firstName, customer.lastName].filter(Boolean).join(" ").trim() ||
      String(customer.name || "").trim();

    if (!customerName) {
      return res.status(400).json({ error: "Your name is required" });
    }
    if (!customer.phone || !String(customer.phone).trim()) {
      return res.status(400).json({ error: "A contact phone is required" });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Please add at least one product" });
    }

    // Validate items + price them server-side (never trust client prices).
    const lineItems = [];
    let total = 0;
    for (let i = 0; i < items.length; i++) {
      const product = await getDbRow(
        "SELECT * FROM products WHERE productKey = ? AND active = 1",
        [items[i].productKey]
      );
      if (!product) {
        return res.status(400).json({ error: `Unknown product: ${items[i].productKey}` });
      }
      const qty = Math.max(1, parseInt(items[i].quantity, 10) || 1);
      total += product.price * qty;
      lineItems.push({ id: uuidv4(), index: i, product, qty, unitPrice: product.price, images: [] });
    }

    const orderId = uuidv4();
    const createdAt = Date.now();
    await runDb(
      `INSERT INTO orders
         (id, customerName, firstName, lastName, email, phone, address, city, province, postalCode, deliveryMethod, notes, total, status, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', ?)`,
      [
        orderId,
        customerName,
        customer.firstName || "",
        customer.lastName || "",
        customer.email || "",
        customer.phone || "",
        customer.address || "",
        customer.city || "",
        customer.province || "",
        customer.postalCode || "",
        customer.deliveryMethod || "",
        customer.notes || "",
        total,
        createdAt,
      ]
    );

    for (const li of lineItems) {
      await runDb(
        `INSERT INTO order_items (id, orderId, productKey, productName, unitPrice, quantity)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [li.id, orderId, li.product.productKey, li.product.name, li.unitPrice, li.qty]
      );
    }

    // Upload each item's photos. Fieldnames:
    //   item_<i>        → a normal photo (slot 'photo')
    //   item_<i>_front  → front photo (double-sided)
    //   item_<i>_back   → back photo  (double-sided)
    const files = req.files || [];
    for (const li of lineItems) {
      const itemFiles = files.filter(
        (f) => f.fieldname.startsWith(`item_${li.index}`) && f.mimetype.startsWith("image/")
      );
      for (const file of itemFiles) {
        const suffix = file.fieldname.slice(`item_${li.index}`.length); // "", "_front", "_back"
        const slot = suffix === "_front" ? "front" : suffix === "_back" ? "back" : "photo";
        const result = await uploadOrderBuffer(file.buffer, orderId, file.originalname);
        await runDb(
          "INSERT INTO order_images (id, orderId, orderItemId, publicId, url, slot) VALUES (?, ?, ?, ?, ?, ?)",
          [uuidv4(), orderId, li.id, result.public_id, result.secure_url, slot]
        );
        li.images.push(result.secure_url);
      }
    }

    // Notify the business by email (doesn't block the response).
    sendOrderEmail(
      {
        customerName,
        email: customer.email,
        phone: customer.phone,
        address: [customer.address, customer.city, customer.province, customer.postalCode].filter(Boolean).join(", "),
        notes: customer.notes,
        deliveryMethod: customer.deliveryMethod,
        total,
      },
      lineItems
    );

    res.json({ message: "Order placed successfully", orderId });
  } catch (error) {
    console.error("Place order error:", error);
    res.status(500).json({ error: "Failed to place order" });
  }
});

// ─── Admin: product management ───
app.get("/api/admin/products", adminMiddleware, async (req, res) => {
  try {
    const rows = await getAllDbRows("SELECT * FROM products ORDER BY sortOrder ASC, name ASC");
    res.json(rows);
  } catch (error) {
    console.error("Admin list products error:", error);
    res.status(500).json({ error: "Failed to load products" });
  }
});

app.put("/api/admin/products/:key", adminMiddleware, async (req, res) => {
  try {
    const { key } = req.params;
    const { name, price, description, active } = req.body;

    const product = await getDbRow("SELECT * FROM products WHERE productKey = ?", [key]);
    if (!product) return res.status(404).json({ error: "Product not found" });

    const updates = [];
    const params = [];
    if (name !== undefined) {
      if (!String(name).trim()) return res.status(400).json({ error: "Name cannot be empty" });
      updates.push("name = ?");
      params.push(String(name).trim());
    }
    if (price !== undefined) {
      const p = Number(price);
      if (!Number.isFinite(p) || p < 0) return res.status(400).json({ error: "Invalid price" });
      updates.push("price = ?");
      params.push(p);
    }
    if (description !== undefined) {
      updates.push("description = ?");
      params.push(String(description || ""));
    }
    if (active !== undefined) {
      updates.push("active = ?");
      params.push(active ? 1 : 0);
    }
    if (updates.length === 0) return res.status(400).json({ error: "Nothing to update" });

    updates.push("updatedAt = ?");
    params.push(Date.now());
    params.push(key);
    await runDb(`UPDATE products SET ${updates.join(", ")} WHERE productKey = ?`, params);
    res.json({ message: "Product updated" });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ error: "Failed to update product" });
  }
});

// Upload/replace a product photo (shown on the store card).
app.post("/api/admin/products/:key/image", adminMiddleware, upload.single("file"), async (req, res) => {
  try {
    if (!cloudinaryConfigured()) return res.status(500).json({ error: "Cloudinary not configured." });
    const { key } = req.params;
    const product = await getDbRow("SELECT * FROM products WHERE productKey = ?", [key]);
    if (!product) return res.status(404).json({ error: "Product not found" });
    if (!req.file || !req.file.mimetype.startsWith("image/")) {
      return res.status(400).json({ error: "Please upload an image" });
    }

    const result = await uploadPublicBuffer(req.file.buffer, req.file.originalname, "products");
    // Remove the previous image (best-effort) so old files don't pile up.
    if (product.imagePublicId) await deletePublicAsset(product.imagePublicId);

    await runDb(
      "UPDATE products SET imageUrl = ?, imagePublicId = ?, updatedAt = ? WHERE productKey = ?",
      [result.secure_url, result.public_id, Date.now(), key]
    );
    res.json({ message: "Product photo updated", imageUrl: result.secure_url });
  } catch (error) {
    console.error("Product image error:", error);
    res.status(500).json({ error: "Failed to upload product photo" });
  }
});

// ─── Admin: order management ───
app.get("/api/admin/orders", adminMiddleware, async (req, res) => {
  try {
    const orders = await getAllDbRows("SELECT * FROM orders ORDER BY createdAt DESC");
    const full = [];
    for (const o of orders) full.push(await loadOrderFull(o));
    res.json(full);
  } catch (error) {
    console.error("List orders error:", error);
    res.status(500).json({ error: "Failed to load orders" });
  }
});

app.put("/api/admin/orders/:id", adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!["new", "done"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    const order = await getDbRow("SELECT id FROM orders WHERE id = ?", [id]);
    if (!order) return res.status(404).json({ error: "Order not found" });
    await runDb("UPDATE orders SET status = ? WHERE id = ?", [status, id]);
    res.json({ message: "Order updated" });
  } catch (error) {
    console.error("Update order error:", error);
    res.status(500).json({ error: "Failed to update order" });
  }
});

app.delete("/api/admin/orders/:id", adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const order = await getDbRow("SELECT id FROM orders WHERE id = ?", [id]);
    if (!order) return res.status(404).json({ error: "Order not found" });
    await deleteOrderImages(id);
    await runDb("DELETE FROM order_images WHERE orderId = ?", [id]);
    await runDb("DELETE FROM order_items WHERE orderId = ?", [id]);
    await runDb("DELETE FROM orders WHERE id = ?", [id]);
    res.json({ message: "Order deleted" });
  } catch (error) {
    console.error("Delete order error:", error);
    res.status(500).json({ error: "Failed to delete order" });
  }
});

// ─── Original Email Endpoint (kept for backwards compatibility) ───
// Public + unauthenticated, so throttle it to deter spam/abuse.
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many inquiries sent. Please try again later." },
});

// Escape user-supplied values before embedding them in the HTML email body
// to prevent HTML/markup injection into the inbox.
function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

app.post("/send", contactLimiter, async (req, res) => {
  const name = escapeHtml(req.body.name);
  const email = escapeHtml(req.body.email);
  const phone = escapeHtml(req.body.phone);
  const eventType = escapeHtml(req.body.eventType);
  const date = escapeHtml(req.body.date);
  const guests = escapeHtml(req.body.guests);
  const message = escapeHtml(req.body.message);

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    const mailOptions = {
      from: `"Memorify Website" <${process.env.EMAIL}>`,
      to: process.env.EMAIL,
      subject: "New Inquiry - Memorify",

      html: `
        <h2>New Booking Inquiry</h2>

        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Phone:</b> ${phone}</p>

        <hr/>

        <p><b>Event Type:</b> ${eventType}</p>
        <p><b>Date:</b> ${date}</p>
        <p><b>Guests:</b> ${guests}</p>

        <hr/>

        <p><b>Message:</b><br/> ${message}</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.log("EMAIL ERROR:", error);
    res.status(500).json({ error: "Error sending email" });
  }
});

// ─── Health check ───
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// ─── Error handler (must be last) ───
// Turns multer/upload rejections and any uncaught route error into clean JSON
// so the frontend always gets a parseable { error } instead of an HTML 500 page.
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);

  if (err && err.name === "MulterError") {
    const msg =
      err.code === "LIMIT_FILE_SIZE"
        ? "A file is too large (max 50MB each)."
        : err.code === "LIMIT_FILE_COUNT"
          ? "Too many files (max 50 per upload)."
          : "File upload failed.";
    return res.status(400).json({ error: msg });
  }

  // Custom file-type rejection from uploadHandler's fileFilter.
  if (err && typeof err.message === "string" && err.message.startsWith("File type not allowed")) {
    return res.status(400).json({ error: err.message });
  }

  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Something went wrong" });
});

// Last-resort safety nets so an unexpected async throw logs instead of
// silently crashing the process.
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection:", reason);
});

// ─── Server startup ───
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Initialize database
    await initDb();
    console.log("✅ Database initialized");

    // Start cleanup job
    startCleanupJob();

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n👋 Shutting down...");
  await closeDb();
  process.exit(0);
});

startServer();
