import pkg from "@prisma/client";
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

/**
 * Generates a standardized user ID based on role and current year
 * Format: {PREFIX}{YEAR}{6-DIGIT-COUNTER}
 * Examples: S2025000001, T2025000001, A2025000001
 *
 * @param {string} role - User role ('student', 'teacher', 'admin')
 * @returns {Promise<string>} Generated unique user ID
 */
export const generateStandardizedUserId = async (role) => {
  // Determine prefix based on role
  const prefixMap = {
    student: "S",
    teacher: "T",
    admin: "A",
  };

  const prefix = prefixMap[role] || "S"; // Default to 'S' if role not found
  const currentYear = new Date().getFullYear();
  const basePattern = `${prefix}${currentYear}`;

  // Find the highest existing counter for this year and role
  const existingUsers = await prisma.users.findMany({
    where: {
      userId: {
        startsWith: basePattern,
      },
    },
    select: {
      userId: true,
    },
    orderBy: {
      userId: "desc",
    },
  });

  let counter = 1;

  if (existingUsers.length > 0) {
    // Extract the counter from the most recent user ID
    const latestUserId = existingUsers[0].userId;
    const counterPart = latestUserId.slice(basePattern.length);
    const latestCounter = parseInt(counterPart, 10);

    if (!isNaN(latestCounter)) {
      counter = latestCounter + 1;
    }
  }

  // Generate the new user ID
  let userId;
  let exists = true;

  // Loop to ensure uniqueness (in case of race conditions or gaps)
  while (exists && counter <= 999999) {
    userId = `${basePattern}${counter.toString().padStart(6, "0")}`;

    const existingUser = await prisma.users.findUnique({
      where: { userId },
    });

    if (!existingUser) {
      exists = false;
    } else {
      counter++;
    }
  }

  if (counter > 999999) {
    throw new Error(
      `Cannot generate user ID: counter limit exceeded for ${basePattern}`
    );
  }

  return userId;
};

/**
 * Validates if a user ID follows the standardized format
 * Format: {PREFIX}{YEAR}{6-DIGIT-COUNTER}
 *
 * @param {string} userId - User ID to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const isValidUserId = (userId) => {
  // Pattern: S/T/A + 4-digit year + 6-digit counter
  const pattern = /^[STA]\d{4}\d{6}$/;
  return pattern.test(userId);
};

/**
 * Parses a standardized user ID into its components
 *
 * @param {string} userId - User ID to parse
 * @returns {Object|null} Object with prefix, year, counter or null if invalid
 */
export const parseUserId = (userId) => {
  if (!isValidUserId(userId)) {
    return null;
  }

  return {
    prefix: userId[0],
    year: userId.slice(1, 5),
    counter: userId.slice(5),
    role:
      userId[0] === "S" ? "student" : userId[0] === "T" ? "teacher" : "admin",
  };
};
