import sqlite3 from "sqlite3";
import bcrypt from "bcrypt";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// In production, point DB_PATH at a persistent disk (e.g. /var/data/memorify.db)
// so the database survives restarts and redeploys. Defaults to local file in dev.
const dbPath = process.env.DB_PATH || path.join(__dirname, "memorify.db");

let db = null;

export function initDb() {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        reject(err);
      } else {
        db.run("PRAGMA journal_mode = WAL", (err) => {
          if (err) {
            reject(err);
          } else {
            createTables()
              .then(() => resolve(db))
              .catch(reject);
          }
        });
      }
    });
  });
}

function createTables() {
  return new Promise((resolve, reject) => {
    const schema = `
      CREATE TABLE IF NOT EXISTS admin_users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        passwordHash TEXT NOT NULL,
        createdAt INTEGER NOT NULL
      );

      -- Persistent admin sessions. Living in the DB (instead of an in-memory
      -- Map) means logins survive server restarts and can carry an expiry.
      CREATE TABLE IF NOT EXISTS admin_sessions (
        id TEXT PRIMARY KEY,
        sessionToken TEXT UNIQUE NOT NULL,
        adminId TEXT NOT NULL,
        createdAt INTEGER NOT NULL,
        expiresAt INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS folders (
        id TEXT PRIMARY KEY,
        folderName TEXT NOT NULL,
        passwordHash TEXT NOT NULL,
        description TEXT,
        createdAt INTEGER NOT NULL,
        expiresAt INTEGER NOT NULL
      );

      -- One row per uploaded asset. Replaces the old "read files off disk"
      -- approach now that media lives in Cloudinary. publicId + resourceType
      -- are all we need to re-sign a delivery URL on demand.
      CREATE TABLE IF NOT EXISTS gallery_images (
        id TEXT PRIMARY KEY,
        folderId TEXT NOT NULL,
        publicId TEXT NOT NULL,
        resourceType TEXT NOT NULL,
        format TEXT,
        originalName TEXT,
        bytes INTEGER,
        createdAt INTEGER NOT NULL,
        FOREIGN KEY (folderId) REFERENCES folders(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_gallery_images_folderId
        ON gallery_images (folderId);
    `;

    db.exec(schema, async (err) => {
      if (err) {
        reject(err);
      } else {
        try {
          await migrateSchema();
          await seedAdminUser();
          resolve();
        } catch (migErr) {
          reject(migErr);
        }
      }
    });
  });
}

/**
 * Idempotent column migrations for databases created before a schema change.
 * `CREATE TABLE IF NOT EXISTS` won't alter an existing table, so we add the
 * new admin_sessions columns here and ignore the "duplicate column" error that
 * occurs once they're already present.
 */
async function migrateSchema() {
  const alters = [
    "ALTER TABLE admin_sessions ADD COLUMN adminId TEXT",
    "ALTER TABLE admin_sessions ADD COLUMN expiresAt INTEGER",
  ];
  for (const sql of alters) {
    try {
      await runDb(sql);
    } catch (err) {
      if (!/duplicate column name/i.test(err.message)) throw err;
    }
  }
}

async function seedAdminUser() {
  return new Promise((resolve) => {
    db.get("SELECT id FROM admin_users WHERE username = ?", ["admin"], async (err, row) => {
      if (!row) {
        const hashedPassword = await bcrypt.hash("memorifymemorify", 10);
        const adminId = `admin_${Date.now()}`;

        db.run(
          "INSERT INTO admin_users (id, username, passwordHash, createdAt) VALUES (?, ?, ?, ?)",
          [adminId, "admin", hashedPassword, Date.now()],
          () => {
            console.log("✅ Admin user created: username=admin, password=memorifymemorify");
            resolve();
          }
        );
      } else {
        resolve();
      }
    });
  });
}

export function getDb() {
  if (!db) {
    throw new Error("Database not initialized. Call initDb() first.");
  }
  return db;
}

export function runDb(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

export function getDbRow(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

export function getAllDbRows(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

export async function closeDb() {
  if (db) {
    return new Promise((resolve, reject) => {
      db.close((err) => {
        if (err) reject(err);
        else {
          db = null;
          resolve();
        }
      });
    });
  }
}
