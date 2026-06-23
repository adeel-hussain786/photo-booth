import { createClient } from "@libsql/client";
import bcrypt from "bcrypt";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let client = null;

export function initDb() {
  // Read env INSIDE initDb (not at module top) so it runs AFTER the .env loader
  // has populated process.env. Reading at import time would capture empty values.
  //
  // Production (Render/host): set TURSO_DATABASE_URL + TURSO_AUTH_TOKEN and we talk
  // to the hosted Turso (libSQL) database — it's persistent and survives restarts,
  // which a free host's local disk does NOT.
  // Local dev (your PC): if those env vars are absent we fall back to a local SQLite
  // file via libSQL's built-in file driver, so nothing extra is needed to run locally.
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;

  if (tursoUrl) {
    client = createClient({ url: tursoUrl, authToken: tursoToken });
    console.log("🗄️  Database: Turso (remote, persistent)");
  } else {
    const localFile = process.env.DB_PATH || path.join(__dirname, "memorify.db");
    // libSQL file URLs need forward slashes; an absolute Windows path → file:///U:/...
    const localUrl =
      "file:" +
      (path.isAbsolute(localFile) ? "///" + localFile.replace(/\\/g, "/") : localFile.replace(/\\/g, "/"));
    client = createClient({ url: localUrl });
    console.log("🗄️  Database: local file (dev)");
  }
  return createTables().then(() => client);
}

async function createTables() {
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

    -- Images the admin adds to the PUBLIC website portfolio (/gallery page).
    -- These are public Cloudinary assets, so we store the delivery URL plus
    -- the publicId needed to delete them later.
    CREATE TABLE IF NOT EXISTS site_gallery_images (
      id TEXT PRIMARY KEY,
      publicId TEXT NOT NULL,
      url TEXT NOT NULL,
      originalName TEXT,
      createdAt INTEGER NOT NULL
    );

    -- ─── Store: products customers can order (magnet, keychain) ───
    CREATE TABLE IF NOT EXISTS products (
      productKey TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price REAL NOT NULL DEFAULT 0,
      description TEXT,
      imageUrl TEXT,
      imagePublicId TEXT,
      photoMode TEXT NOT NULL DEFAULT 'single',
      unitCount INTEGER NOT NULL DEFAULT 1,
      sortOrder INTEGER NOT NULL DEFAULT 0,
      active INTEGER NOT NULL DEFAULT 1,
      updatedAt INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      customerName TEXT NOT NULL,
      firstName TEXT,
      lastName TEXT,
      email TEXT,
      phone TEXT,
      address TEXT,
      city TEXT,
      province TEXT,
      postalCode TEXT,
      deliveryMethod TEXT,
      notes TEXT,
      total REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'new',
      createdAt INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      orderId TEXT NOT NULL,
      productKey TEXT NOT NULL,
      productName TEXT NOT NULL,
      unitPrice REAL NOT NULL DEFAULT 0,
      quantity INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE
    );

    -- Customer-supplied photos to print, one row per image, linked to a line item.
    CREATE TABLE IF NOT EXISTS order_images (
      id TEXT PRIMARY KEY,
      orderId TEXT NOT NULL,
      orderItemId TEXT NOT NULL,
      publicId TEXT NOT NULL,
      url TEXT NOT NULL,
      slot TEXT NOT NULL DEFAULT 'photo',
      FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_order_items_orderId ON order_items (orderId);
    CREATE INDEX IF NOT EXISTS idx_order_images_orderId ON order_images (orderId);
  `;

  // executeMultiple runs every statement in the schema string in one round-trip.
  await client.executeMultiple(schema);
  await migrateSchema();
  await seedAdminUser();
  await seedProducts();
}

/**
 * Idempotent column migrations for databases created before a schema change.
 * `CREATE TABLE IF NOT EXISTS` won't alter an existing table, so we add the
 * new columns here and ignore the "duplicate column" error that occurs once
 * they're already present.
 */
async function migrateSchema() {
  const alters = [
    "ALTER TABLE admin_sessions ADD COLUMN adminId TEXT",
    "ALTER TABLE admin_sessions ADD COLUMN expiresAt INTEGER",
    "ALTER TABLE products ADD COLUMN imageUrl TEXT",
    "ALTER TABLE products ADD COLUMN imagePublicId TEXT",
    "ALTER TABLE products ADD COLUMN photoMode TEXT NOT NULL DEFAULT 'single'",
    "ALTER TABLE products ADD COLUMN unitCount INTEGER NOT NULL DEFAULT 1",
    "ALTER TABLE products ADD COLUMN sortOrder INTEGER NOT NULL DEFAULT 0",
    "ALTER TABLE orders ADD COLUMN firstName TEXT",
    "ALTER TABLE orders ADD COLUMN lastName TEXT",
    "ALTER TABLE orders ADD COLUMN city TEXT",
    "ALTER TABLE orders ADD COLUMN province TEXT",
    "ALTER TABLE orders ADD COLUMN postalCode TEXT",
    "ALTER TABLE orders ADD COLUMN deliveryMethod TEXT",
    "ALTER TABLE order_images ADD COLUMN slot TEXT NOT NULL DEFAULT 'photo'",
  ];
  for (const sql of alters) {
    try {
      await runDb(sql);
    } catch (err) {
      if (!/duplicate column name/i.test(err.message || "")) throw err;
    }
  }
}

async function seedAdminUser() {
  const row = await getDbRow("SELECT id FROM admin_users WHERE username = ?", ["admin"]);
  if (!row) {
    const hashedPassword = await bcrypt.hash("memorifymemorify", 10);
    const adminId = `admin_${Date.now()}`;
    await runDb(
      "INSERT INTO admin_users (id, username, passwordHash, createdAt) VALUES (?, ?, ?, ?)",
      [adminId, "admin", hashedPassword, Date.now()]
    );
    console.log("✅ Admin user created: username=admin, password=memorifymemorify");
  }
}

// Ensure the store products exist. INSERT OR IGNORE means admin price/name edits
// made later are never overwritten on restart — only missing products are added.
async function seedProducts() {
  const defaults = [
    { key: "magnet", name: "Custom Photo Magnet", price: 4.99, mode: "single", units: 1, sort: 1,
      desc: "Personalized with your photo · Premium print quality · Strong magnetic backing · Perfect for fridges, lockers, and office spaces." },
    { key: "keychain_single", name: "Single Sided Photo Keychain", price: 4.99, mode: "single", units: 1, sort: 2,
      desc: "Personalized with your photo · Durable acrylic finish · Premium photo print · Great for gifts and everyday use." },
    { key: "keychain_double", name: "Double Sided Photo Keychain", price: 8.99, mode: "double", units: 1, sort: 3,
      desc: "Different photo on each side · Durable acrylic finish · Premium photo print · Most popular option." },
    { key: "bundle_magnet_4", name: "4 Custom Magnets", price: 17.99, mode: "single", units: 4, sort: 4,
      desc: "Bundle of 4 custom photo magnets — upload up to 4 photos." },
    { key: "bundle_keychain_4", name: "4 Single Sided Keychains", price: 17.99, mode: "single", units: 4, sort: 5,
      desc: "Bundle of 4 single-sided keychains — upload up to 4 photos." },
    { key: "bundle_magnet_10", name: "10 Custom Magnets", price: 39.99, mode: "single", units: 10, sort: 6,
      desc: "Bundle of 10 custom photo magnets — upload up to 10 photos." },
    { key: "bundle_keychain_10", name: "10 Single Sided Keychains", price: 39.99, mode: "single", units: 10, sort: 7,
      desc: "Bundle of 10 single-sided keychains — upload up to 10 photos." },
  ];
  for (const p of defaults) {
    await runDb(
      `INSERT OR IGNORE INTO products
         (productKey, name, price, description, photoMode, unitCount, sortOrder, active, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)`,
      [p.key, p.name, p.price, p.desc, p.mode, p.units, p.sort, Date.now()]
    );
  }
}

export function getDb() {
  if (!client) {
    throw new Error("Database not initialized. Call initDb() first.");
  }
  return client;
}

// ─── Query helpers (same signatures as before, so callers don't change) ───
export async function runDb(sql, params = []) {
  const r = await client.execute({ sql, args: params });
  return {
    lastID: r.lastInsertRowid != null ? Number(r.lastInsertRowid) : undefined,
    changes: r.rowsAffected,
  };
}

export async function getDbRow(sql, params = []) {
  const r = await client.execute({ sql, args: params });
  return r.rows[0];
}

export async function getAllDbRows(sql, params = []) {
  const r = await client.execute({ sql, args: params });
  return r.rows;
}

export async function closeDb() {
  if (client) {
    client.close();
    client = null;
  }
}
