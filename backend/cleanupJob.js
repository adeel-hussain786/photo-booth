import cron from "node-cron";
import { getAllDbRows, runDb } from "./db.js";
import { deleteGallery } from "./cloudinary.js";

export function startCleanupJob() {
  // Run daily at 2 AM
  cron.schedule("0 2 * * *", async () => {
    console.log("🧹 Starting folder cleanup job...");
    try {
      await cleanupExpiredFolders();
    } catch (error) {
      console.error("❌ Cleanup job failed:", error);
    }
  });

  console.log("✅ Cleanup job scheduled to run daily at 2 AM");
}

export async function cleanupExpiredFolders() {
  const now = Date.now();

  // Get all expired folders
  const expiredFolders = await getAllDbRows(
    "SELECT id FROM folders WHERE expiresAt < ?",
    [now]
  );

  if (expiredFolders.length === 0) {
    console.log("ℹ️  No expired folders to clean up");
    return;
  }

  for (const folder of expiredFolders) {
    try {
      // Remove the media from Cloudinary, then the DB rows. Order matters:
      // delete storage first so a crash can't leave paid assets with no
      // record pointing at them.
      await deleteGallery(folder.id);
      await runDb("DELETE FROM gallery_images WHERE folderId = ?", [folder.id]);
      await runDb("DELETE FROM folders WHERE id = ?", [folder.id]);
      console.log(`✅ Deleted expired folder: ${folder.id}`);
    } catch (error) {
      console.error(`❌ Failed to delete folder ${folder.id}:`, error);
    }
  }

  console.log(`✅ Cleanup completed. ${expiredFolders.length} folders deleted.`);
}

// Export function for manual testing
export async function cleanupExpiredFoldersManual() {
  console.log("🧹 Running manual cleanup...");
  await cleanupExpiredFolders();
}
