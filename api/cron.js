import cron from "node-cron";
import { cleanupOrphanedPayments } from "./services/payment_service.js";

// Run every 3 minutes (for testing)
// cron.schedule("*/3 * * * *", async () => {
// Run every hour at minute 0 (change schedule as needed)
cron.schedule("0 * * * *", async () => {
  console.log("[CRON] Running orphaned payments cleanup...");
  try {
    const result = await cleanupOrphanedPayments();
    console.log("[CRON] Cleanup result:", result);
  } catch (error) {
    console.error("[CRON] Cleanup error:", error);
  }
});
