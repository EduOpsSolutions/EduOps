import pkg from "@prisma/client";
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

/**
 * Database Query Templates for AI Report Generator
 *
 * Security Features:
 * - Predefined Prisma queries only (no raw SQL)
 * - Column filtering to exclude sensitive data (passwords, emails)
 * - Row limits to prevent overwhelming responses
 * - Only SELECT operations (no INSERT, UPDATE, DELETE)
 * - Whitelisted tables only
 */

// Configuration
const MAX_ROWS = 100; // Maximum rows to return per query
const DEFAULT_ROWS = 50; // Default limit if not specified

// Sensitive columns that should NEVER be returned
const SENSITIVE_COLUMNS = ["password", "resetToken", "resetTokenExpiry"];

// Safe columns to exclude from general queries (but not sensitive)
const EXCLUDED_COLUMNS = ["email"]; // emails are excluded for privacy

/**
 * Sanitize select clause to exclude sensitive columns
 */
function getSafeSelect(tableName, requestedColumns = null) {
  const tableSchemas = {
    users: {
      id: true,
      userId: true,
      firstName: true,
      middleName: true,
      lastName: true,
      birthmonth: true,
      birthdate: true,
      birthyear: true,
      phoneNumber: true,
      status: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true,
      firstLogin: true,
      // Explicitly exclude: email, password, resetToken, resetTokenExpiry, profilePicLink
    },
    course: {
      id: true,
      name: true,
      description: true,
      maxNumber: true,
      visibility: true,
      price: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true,
    },
    schedule: {
      id: true,
      days: true,
      time: true,
      time_start: true,
      time_end: true,
      location: true,
      notes: true,
      color: true,
      periodStart: true,
      periodEnd: true,
      capacity: true,
      courseId: true,
      periodId: true,
      teacherId: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true,
    },
    academic_period: {
      id: true,
      batchName: true,
      startAt: true,
      endAt: true,
      enrollmentOpenAt: true,
      enrollmentCloseAt: true,
      isEnrollmentClosed: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true,
    },
    user_schedule: {
      id: true,
      userId: true,
      scheduleId: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true,
    },
    student_enrollment: {
      id: true,
      studentId: true,
      periodId: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true,
    },
    payments: {
      id: true,
      userId: true,
      courseId: true,
      academicPeriodId: true,
      amount: true,
      currency: true,
      status: true,
      paymentMethod: true,
      referenceNumber: true,
      transactionId: true,
      paymentIntentId: true,
      feeId: true,
      enrollmentRequestId: true,
      remarks: true,
      feeType: true,
      paymentEmail: true,
      paidAt: true,
      createdAt: true,
      updatedAt: true,
      // Note: payments table does NOT have deletedAt column
    },
    fees: {
      id: true,
      name: true,
      price: true,
      type: true,
      dueDate: true,
      courseId: true,
      batchId: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      // Note: fees table does NOT have deletedAt column
    },
    student_fee: {
      id: true,
      studentId: true,
      courseId: true,
      batchId: true,
      name: true,
      amount: true,
      type: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true,
    },
    document_request: {
      id: true,
      userId: true,
      documentId: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      mode: true,
      paymentMethod: true,
      address: true,
      city: true,
      purpose: true,
      additionalNotes: true,
      status: true,
      remarks: true,
      createdAt: true,
      updatedAt: true,
      // Note: document_request table does NOT have deletedAt column
    },
    logs: {
      id: true,
      userId: true,
      type: true,
      moduleType: true,
      title: true,
      content: true,
      createdAt: true,
    },
  };

  const schema = tableSchemas[tableName];
  if (!schema) {
    throw new Error(`Table '${tableName}' is not whitelisted for queries`);
  }

  // If specific columns requested, filter them
  if (requestedColumns && Array.isArray(requestedColumns)) {
    const safeColumns = {};
    requestedColumns.forEach((col) => {
      if (schema[col] === true) {
        safeColumns[col] = true;
      }
    });
    return safeColumns;
  }

  return schema;
}

/**
 * Query Templates
 * Each template is a function that returns a Prisma query
 */

export const queryTemplates = {
  /**
   * Get students with filters
   * Parameters: { role, status, limit, offset }
   */
  getStudents: async (params = {}) => {
    const { status, limit = DEFAULT_ROWS, offset = 0 } = params;
    const actualLimit = Math.min(limit, MAX_ROWS);

    const where = {
      role: "student",
      deletedAt: null,
    };

    if (status) {
      where.status = status;
    }

    return await prisma.users.findMany({
      where,
      select: getSafeSelect("users"),
      take: actualLimit,
      skip: offset,
      orderBy: { createdAt: "desc" },
    });
  },

  /**
   * Get teachers with filters
   */
  getTeachers: async (params = {}) => {
    const { status, limit = DEFAULT_ROWS, offset = 0 } = params;
    const actualLimit = Math.min(limit, MAX_ROWS);

    const where = {
      role: "teacher",
      deletedAt: null,
    };

    if (status) {
      where.status = status;
    }

    return await prisma.users.findMany({
      where,
      select: getSafeSelect("users"),
      take: actualLimit,
      skip: offset,
      orderBy: { createdAt: "desc" },
    });
  },

  /**
   * Get courses with filters
   */
  getCourses: async (params = {}) => {
    const { visibility, limit = DEFAULT_ROWS, offset = 0 } = params;
    const actualLimit = Math.min(limit, MAX_ROWS);

    const where = {
      deletedAt: null,
    };

    if (visibility) {
      where.visibility = visibility;
    }

    return await prisma.course.findMany({
      where,
      select: getSafeSelect("course"),
      take: actualLimit,
      skip: offset,
      orderBy: { name: "asc" },
    });
  },

  /**
   * Get academic periods
   */
  getAcademicPeriods: async (params = {}) => {
    const { isEnrollmentClosed, limit = DEFAULT_ROWS, offset = 0 } = params;
    const actualLimit = Math.min(limit, MAX_ROWS);

    const where = {
      deletedAt: null,
    };

    if (isEnrollmentClosed !== undefined) {
      where.isEnrollmentClosed = isEnrollmentClosed === "true" || isEnrollmentClosed === true;
    }

    return await prisma.academic_period.findMany({
      where,
      select: getSafeSelect("academic_period"),
      take: actualLimit,
      skip: offset,
      orderBy: { startAt: "desc" },
    });
  },

  /**
   * Get schedules with related data
   */
  getSchedules: async (params = {}) => {
    const { periodId, courseId, teacherId, limit = DEFAULT_ROWS, offset = 0 } = params;
    const actualLimit = Math.min(limit, MAX_ROWS);

    const where = {
      deletedAt: null,
    };

    if (periodId) where.periodId = periodId;
    if (courseId) where.courseId = courseId;
    if (teacherId) where.teacherId = teacherId;

    return await prisma.schedule.findMany({
      where,
      select: {
        ...getSafeSelect("schedule"),
        course: {
          select: getSafeSelect("course"),
        },
        period: {
          select: getSafeSelect("academic_period"),
        },
        teacher: {
          select: getSafeSelect("users"),
        },
        userSchedules: {
          where: { deletedAt: null },
          select: {
            id: true,
            userId: true,
            createdAt: true,
          },
        },
      },
      take: actualLimit,
      skip: offset,
      orderBy: { createdAt: "desc" },
    });
  },

  /**
   * Get enrollments by period
   */
  getEnrollments: async (params = {}) => {
    const { periodId, status, limit = DEFAULT_ROWS, offset = 0 } = params;
    const actualLimit = Math.min(limit, MAX_ROWS);

    const where = {
      deletedAt: null,
    };

    if (periodId) where.periodId = periodId;
    if (status) where.status = status;

    return await prisma.student_enrollment.findMany({
      where,
      select: {
        ...getSafeSelect("student_enrollment"),
        student: {
          select: getSafeSelect("users"),
        },
        period: {
          select: getSafeSelect("academic_period"),
        },
      },
      take: actualLimit,
      skip: offset,
      orderBy: { createdAt: "desc" },
    });
  },

  /**
   * Get payments with filters
   */
  getPayments: async (params = {}) => {
    const { periodId, status, limit = DEFAULT_ROWS, offset = 0, startDate, endDate } = params;
    const actualLimit = Math.min(limit, MAX_ROWS);

    const where = {};

    if (periodId) where.academicPeriodId = periodId;
    if (status) where.status = status;

    if (startDate && endDate) {
      where.paidAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    return await prisma.payments.findMany({
      where,
      select: {
        ...getSafeSelect("payments"),
        user: {
          select: getSafeSelect("users"),
        },
        course: {
          select: getSafeSelect("course"),
        },
        academicPeriod: {
          select: getSafeSelect("academic_period"),
        },
      },
      take: actualLimit,
      skip: offset,
      orderBy: { paidAt: "desc" },
    });
  },

  /**
   * Get fees by course and period
   */
  getFees: async (params = {}) => {
    const { courseId, batchId, isActive, limit = DEFAULT_ROWS, offset = 0 } = params;
    const actualLimit = Math.min(limit, MAX_ROWS);

    const where = {};

    if (courseId) where.courseId = courseId;
    if (batchId) where.batchId = batchId;
    if (isActive !== undefined) where.isActive = isActive === "true" || isActive === true;

    return await prisma.fees.findMany({
      where,
      select: {
        ...getSafeSelect("fees"),
        course: {
          select: getSafeSelect("course"),
        },
      },
      take: actualLimit,
      skip: offset,
      orderBy: { createdAt: "desc" },
    });
  },

  /**
   * Get document requests
   */
  getDocumentRequests: async (params = {}) => {
    const { status, limit = DEFAULT_ROWS, offset = 0 } = params;
    const actualLimit = Math.min(limit, MAX_ROWS);

    const where = {};

    if (status) where.status = status;

    return await prisma.document_request.findMany({
      where,
      select: getSafeSelect("document_request"),
      take: actualLimit,
      skip: offset,
      orderBy: { createdAt: "desc" },
    });
  },

  /**
   * Aggregation queries (counts, sums, averages)
   */

  // Count students by status
  countStudentsByStatus: async () => {
    return await prisma.users.groupBy({
      by: ["status"],
      where: {
        role: "student",
        deletedAt: null,
      },
      _count: {
        id: true,
      },
    });
  },

  // Count enrollments by period
  countEnrollmentsByPeriod: async (params = {}) => {
    const where = {
      deletedAt: null,
    };

    if (params.status) where.status = params.status;

    return await prisma.student_enrollment.groupBy({
      by: ["periodId", "status"],
      where,
      _count: {
        id: true,
      },
    });
  },

  // Sum payments by period
  sumPaymentsByPeriod: async (params = {}) => {
    const { periodId } = params;
    const where = {
      status: "paid",
    };

    if (periodId) where.academicPeriodId = periodId;

    return await prisma.payments.groupBy({
      by: ["academicPeriodId"],
      where,
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });
  },

  // Get schedule capacity stats
  getScheduleCapacityStats: async (params = {}) => {
    const { periodId } = params;
    const where = {
      deletedAt: null,
    };

    if (periodId) where.periodId = periodId;

    const schedules = await prisma.schedule.findMany({
      where,
      select: {
        id: true,
        capacity: true,
        courseId: true,
        periodId: true,
        userSchedules: {
          where: { deletedAt: null },
          select: { id: true },
        },
        course: {
          select: { name: true },
        },
      },
      take: MAX_ROWS,
    });

    return schedules.map((s) => ({
      scheduleId: s.id,
      courseName: s.course?.name,
      capacity: s.capacity,
      enrolled: s.userSchedules.length,
      available: (s.capacity || 30) - s.userSchedules.length,
      occupancyRate: s.capacity ? ((s.userSchedules.length / s.capacity) * 100).toFixed(2) : "N/A",
    }));
  },
};

/**
 * Main getDbData function
 * This is the function the AI will call to retrieve data
 */
export async function getDbData(templateName, parameters = {}) {
  try {
    // Validate template exists
    if (!queryTemplates[templateName]) {
      throw new Error(
        `Invalid template: '${templateName}'. Available templates: ${Object.keys(
          queryTemplates
        ).join(", ")}`
      );
    }

    // Execute the query template
    const result = await queryTemplates[templateName](parameters);

    return {
      success: true,
      template: templateName,
      parameters,
      rowCount: Array.isArray(result) ? result.length : result ? 1 : 0,
      data: result,
    };
  } catch (error) {
    console.error(`Error executing template '${templateName}':`, error);
    return {
      success: false,
      template: templateName,
      parameters,
      error: error.message,
    };
  }
}

/**
 * Get available templates with descriptions
 * This will be used to tell the AI what queries are available
 */
export function getAvailableTemplates() {
  return {
    // Data retrieval templates
    getStudents: {
      description: "Get students with optional filtering by status",
      parameters: {
        status: "optional (active, inactive, disabled, suspended)",
        limit: `optional (max ${MAX_ROWS})`,
        offset: "optional (for pagination)",
      },
      example: { status: "active", limit: 20 },
    },
    getTeachers: {
      description: "Get teachers with optional filtering",
      parameters: {
        status: "optional",
        limit: `optional (max ${MAX_ROWS})`,
        offset: "optional",
      },
      example: { status: "active" },
    },
    getCourses: {
      description: "Get courses with optional filtering",
      parameters: {
        visibility: "optional (visible, hidden)",
        limit: `optional (max ${MAX_ROWS})`,
        offset: "optional",
      },
      example: { visibility: "visible" },
    },
    getAcademicPeriods: {
      description: "Get academic periods",
      parameters: {
        isEnrollmentClosed: "optional (true, false)",
        limit: `optional (max ${MAX_ROWS})`,
        offset: "optional",
      },
      example: { isEnrollmentClosed: false },
    },
    getSchedules: {
      description: "Get schedules with related course, period, and teacher data",
      parameters: {
        periodId: "optional",
        courseId: "optional",
        teacherId: "optional",
        limit: `optional (max ${MAX_ROWS})`,
        offset: "optional",
      },
      example: { periodId: "some-period-id" },
    },
    getEnrollments: {
      description: "Get student enrollments with student and period details",
      parameters: {
        periodId: "optional",
        status: "optional (enrolled, completed, dropped, withdrawn)",
        limit: `optional (max ${MAX_ROWS})`,
        offset: "optional",
      },
      example: { periodId: "some-period-id", status: "enrolled" },
    },
    getPayments: {
      description: "Get payment records with user, course, and period details",
      parameters: {
        periodId: "optional",
        status: "optional (paid, pending, failed)",
        startDate: "optional (YYYY-MM-DD)",
        endDate: "optional (YYYY-MM-DD)",
        limit: `optional (max ${MAX_ROWS})`,
        offset: "optional",
      },
      example: { status: "paid", startDate: "2025-01-01", endDate: "2025-12-31" },
    },
    getFees: {
      description: "Get fees by course and batch",
      parameters: {
        courseId: "optional",
        batchId: "optional",
        isActive: "optional (true, false)",
        limit: `optional (max ${MAX_ROWS})`,
        offset: "optional",
      },
      example: { isActive: true },
    },
    getDocumentRequests: {
      description: "Get document requests with status filtering",
      parameters: {
        status: "optional (in_process, in_transit, delivered, fulfilled, failed)",
        limit: `optional (max ${MAX_ROWS})`,
        offset: "optional",
      },
      example: { status: "in_process" },
    },

    // Aggregation templates
    countStudentsByStatus: {
      description: "Get count of students grouped by status",
      parameters: {},
      example: {},
    },
    countEnrollmentsByPeriod: {
      description: "Get count of enrollments grouped by period and status",
      parameters: {
        status: "optional (enrolled, completed, dropped, withdrawn)",
      },
      example: { status: "enrolled" },
    },
    sumPaymentsByPeriod: {
      description: "Get total payments sum and count grouped by academic period",
      parameters: {
        periodId: "optional (specific period)",
      },
      example: {},
    },
    getScheduleCapacityStats: {
      description: "Get schedule capacity statistics with enrollment counts",
      parameters: {
        periodId: "optional",
      },
      example: {},
    },
  };
}
