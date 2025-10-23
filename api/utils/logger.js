import { PrismaClient } from "@prisma/client";
import { MODULE_TYPES } from "../constants/module_types.js";

const prisma = new PrismaClient();

/**
 * Utility function to create a log entry in the database
 * This is the ONLY way to create logs - no direct API endpoint for creation
 *
 * @param {Object} logData - The log data
 * @param {string} logData.title - The log title (required)
 * @param {string} [logData.content] - Additional log content
 * @param {string} [logData.reqBody] - Request body as string (for API logs)
 * @param {string} [logData.userId] - User ID who triggered the action
 * @param {string} [logData.moduleType] - Module type (default: 'UNCATEGORIZED')
 * @param {string} [logData.type] - Log type (default: 'user_activity')
 * @returns {Promise<Object>} Result object with success status and log data
 */
export const createLog = async (logData) => {
  try {
    // Validate required fields
    if (!logData.title) {
      throw new Error("Log title is required");
    }

    const log = await prisma.logs.create({
      data: {
        title: logData.title,
        content: logData.content || null,
        reqBody: logData.reqBody || null,
        userId: logData.userId || null,
        moduleType: logData.moduleType || "UNCATEGORIZED",
        type: logData.type || "user_activity",
      },
    });

    return { success: true, log };
  } catch (err) {
    console.error("Create log error:", err);
    return { success: false, error: err.message };
  }
};

/**
 * Helper function to log user activity
 *
 * @param {string} title - Activity title
 * @param {string} userId - User ID
 * @param {string} [moduleType] - Module type
 * @param {string} [content] - Additional content
 */
export const logUserActivity = async (
  title,
  userId,
  moduleType = "UNCATEGORIZED",
  content = null
) => {
  return createLog({
    title,
    userId,
    moduleType,
    content,
    type: "user_activity",
  });
};

/**
 * Helper function to log system activity
 *
 * @param {string} title - Activity title
 * @param {string} [moduleType] - Module type
 * @param {string} [content] - Additional content
 */
export const logSystemActivity = async (
  title,
  moduleType = "SYSTEM",
  content = null
) => {
  return createLog({
    title,
    moduleType,
    content,
    type: "system_activity",
  });
};

/**
 * Helper function to log API responses
 *
 * @param {string} title - Response title
 * @param {Object} req - Express request object
 * @param {string} [userId] - User ID
 * @param {string} [moduleType] - Module type
 */
export const logApiResponse = async (
  title,
  req,
  userId = null,
  moduleType = "UNCATEGORIZED"
) => {
  return createLog({
    title,
    userId,
    moduleType,
    reqBody: JSON.stringify({
      method: req.method,
      path: req.path,
      query: req.query,
      body: req.body,
    }),
    type: "api_response",
  });
};

/**
 * Helper function to log errors
 *
 * @param {string} title - Error title
 * @param {Error} error - Error object
 * @param {string} [userId] - User ID
 * @param {string} [moduleType] - Module type
 */
export const logError = async (
  title,
  error,
  userId = null,
  moduleType = "UNCATEGORIZED"
) => {
  return createLog({
    title,
    userId,
    moduleType,
    content: JSON.stringify({
      message: error.message,
      stack: error.stack,
      name: error.name,
    }),
    type: "error_log",
  });
};

/**
 * Helper function to log security events
 *
 * @param {string} title - Security event title
 * @param {string} [userId] - User ID
 * @param {string} [content] - Additional content
 */
export const logSecurityEvent = async (
  title,
  userId = null,
  content = null
) => {
  return createLog({
    title,
    userId,
    ModuleType: MODULE_TYPES.AUTH,
    content,
    type: "security_log",
  });
};

/**
 * Log types available in the system
 */
export const LogTypes = {
  USER_ACTIVITY: "user_activity",
  SYSTEM_ACTIVITY: "system_activity",
  API_RESPONSE: "api_response",
  ERROR_LOG: "error_log",
  SECURITY_LOG: "security_log",
  OTHER: "other",
};

/**
 * Module types available in the system
 */
// export const ModuleTypes = {
//     UNCATEGORIZED: 'UNCATEGORIZED',
//     AUTH: 'AUTH',
//     ENROLLMENTS: 'ENROLLMENTS',
//     SCHEDULES: 'SCHEDULES',
//     GRADING: 'GRADING',
//     DOCUMENTS: 'DOCUMENTS',
//     PAYMENTS: 'PAYMENTS',
//     REPORTS: 'REPORTS',
//     CONTENTS: 'CONTENTS',
//     SYSTEM: 'SYSTEM'
// };
