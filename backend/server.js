import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import JSZip from "jszip";
import rateLimit from "express-rate-limit";

import { initDb, getDb, runDb, getDbRow, getAllDbRows, closeDb } from "./db.js";
import { upload } from "./uploadHandler.js";
import {
  validateFolderName,
  validatePassword,
  validateDescription,
  validateUsername,
  validateAdminPassword,
} from "./validation.js";
import { startCleanupJob, cleanupExpiredFoldersManual } from "./cleanupJob.js";
import {
  cloudinaryConfigured,
  uploadBuffer,
  signedDisplayUrl,
  signedDownloadUrl,
  deleteGallery,
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

    const db = getDb();
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
    const db = getDb();
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

    const db = getDb();
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

app.delete("/api/admin/folders/:folderId", adminMiddleware, async (req, res) => {
  try {
    const { folderId } = req.params;

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

    const db = getDb();
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

    const db = getDb();
    const folder = await getDbRow("SELECT * FROM folders WHERE id = ?", [folderId]);

    if (!folder) {
      return res.status(404).json({ error: "Folder not found" });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, folder.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // Pull every asset back from Cloudinary (via its signed URL) and stream it
    // into the ZIP. We number the entries to guarantee unique names even when
    // two originals share a filename.
    const rows = await getAllDbRows(
      "SELECT * FROM gallery_images WHERE folderId = ? ORDER BY createdAt ASC",
      [folderId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Gallery has no media to download" });
    }

    const zip = new JSZip();
    let index = 0;
    for (const row of rows) {
      index += 1;
      const url = signedDisplayUrl(row.publicId, row.resourceType, row.format);
      const response = await fetch(url);
      if (!response.ok) {
        console.error(`Failed to fetch ${row.publicId} for ZIP: ${response.status}`);
        continue;
      }
      const buffer = Buffer.from(await response.arrayBuffer());

      const subfolder = row.resourceType === "video" ? "videos" : "images";
      const ext = row.format ? `.${row.format}` : "";
      const base = (row.originalName || `file_${index}`).replace(/\.[^.]+$/, "");
      const safeName = `${String(index).padStart(3, "0")}_${base}${ext}`;
      zip.folder(subfolder).file(safeName, buffer);
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

// ─── Original Email Endpoint (kept for backwards compatibility) ───
app.post("/send", async (req, res) => {
  const { name, email, phone, eventType, date, guests, message } = req.body;

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
