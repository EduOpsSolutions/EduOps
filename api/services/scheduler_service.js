import { markExpiredPayments } from './payment_service.js';

let schedulerInterval = null;

export const startScheduler = () => {
  console.log('Starting job scheduler...');
  
  const CHECK_INTERVAL = 10 * 1000; // 10 seconds (demo mode)

  // Run immediately on startup
  markExpiredPayments().catch(console.error);
  
  // Then run at interval
  schedulerInterval = setInterval(() => {
    markExpiredPayments().catch(console.error);
  }, CHECK_INTERVAL);
  
  console.log('Job scheduler started - checking expired payments every 10 seconds');
};

export const stopScheduler = () => {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log('Job scheduler stopped');
  }
};
