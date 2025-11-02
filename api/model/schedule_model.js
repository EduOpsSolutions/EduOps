import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/**
 * Get all schedules with related data
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of schedules
 */
export const getAllSchedules = async (options = {}) => {
  const {
    includeCourse = true,
    includePeriod = true,
    includeTeacher = true,
  } = options;

  return prisma.schedule.findMany({
    where: {
      deletedAt: null,
    },
    include: {
      course: includeCourse
        ? {
            select: {
              id: true,
              name: true,
              description: true,
              visibility: true,
            },
          }
        : false,
      period: includePeriod
        ? {
            select: {
              id: true,
              batchName: true,
              startAt: true,
              endAt: true,
            },
          }
        : false,
      teacher: includeTeacher
        ? {
            select: {
              id: true,
              userId: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          }
        : false,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

/**
 * Get schedule by ID with related data
 * @param {number} id - Schedule ID
 * @returns {Promise<Object|null>} Schedule object or null
 */
export const getScheduleById = async (id) => {
  return prisma.schedule.findUnique({
    where: { id: parseInt(id) },
    include: {
      course: {
        select: {
          id: true,
          name: true,
          description: true,
        },
      },
      period: {
        select: {
          id: true,
          batchName: true,
          startAt: true,
          endAt: true,
        },
      },
      teacher: {
        select: {
          id: true,
          userId: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });
};

/**
 * Get schedules by academic period
 * @param {string} periodId - Academic period ID
 * @returns {Promise<Array>} Array of schedules
 */
export const getSchedulesByPeriod = async (periodId) => {
  return prisma.schedule.findMany({
    where: {
      periodId,
      deletedAt: null,
    },
    include: {
      course: {
        select: {
          id: true,
          name: true,
        },
      },
      teacher: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });
};

/**
 * Get schedules by teacher
 * @param {string} teacherId - Teacher ID
 * @returns {Promise<Array>} Array of schedules
 */
export const getSchedulesByTeacher = async (teacherId) => {
  return prisma.schedule.findMany({
    where: {
      teacherId,
      deletedAt: null,
    },
    include: {
      course: {
        select: {
          id: true,
          name: true,
        },
      },
      period: {
        select: {
          id: true,
          batchName: true,
        },
      },
    },
  });
};

/**
 * Get schedules for a specific student
 * Includes schedules explicitly linked through user_schedule, and schedules
 * for periods where the student is enrolled.
 * @param {string} studentId - User ID of the student
 * @returns {Promise<Array>} Array of schedules
 */
export const getSchedulesByStudent = async (studentId) => {
  // Fetch schedules that are either explicitly assigned to the student
  // via user_schedule, or belong to an academic period the student is enrolled in.
  return prisma.schedule.findMany({
    where: {
      deletedAt: null,
      OR: [
        {
          userSchedules: {
            some: {
              userId: studentId,
              deletedAt: null,
            },
          },
        },
        {
          period: {
            enrollments: {
              some: {
                studentId,
                deletedAt: null,
              },
            },
          },
        },
      ],
    },
    include: {
      course: {
        select: {
          id: true,
          name: true,
        },
      },
      period: {
        select: {
          id: true,
          batchName: true,
          startAt: true,
          endAt: true,
        },
      },
      teacher: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

/**
 * Create a new schedule
 * @param {Object} data - Schedule data
 * @returns {Promise<Object>} Created schedule
 */
export const createSchedule = async (data) => {
  // Convert date strings to Date objects if provided
  const scheduleData = {
    days: data.days,
    time_start: data.time_start,
    time_end: data.time_end,
    location: data.location,
    notes: data.notes,
    color: data.color,
    capacity: data.capacity !== undefined ? data.capacity : 30,
    periodStart: data.periodStart ? new Date(data.periodStart) : null,
    periodEnd: data.periodEnd ? new Date(data.periodEnd) : null,
    course: data.courseId ? { connect: { id: data.courseId } } : undefined,
    period: data.academicPeriodId
      ? { connect: { id: data.academicPeriodId } }
      : undefined,
    teacher: data.teacherId ? { connect: { id: data.teacherId } } : undefined,
  };

  return prisma.schedule.create({
    data: scheduleData,
    include: {
      course: {
        select: {
          id: true,
          name: true,
        },
      },
      period: {
        select: {
          id: true,
          batchName: true,
        },
      },
      teacher: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });
};

/**
 * Update a schedule
 * @param {number} id - Schedule ID
 * @param {Object} data - Updated schedule data
 * @returns {Promise<Object>} Updated schedule
 */
export const updateSchedule = async (id, data) => {
  // Convert date strings to Date objects if provided
  const scheduleData = {
    days: data.days,
    time_start: data.time_start,
    time_end: data.time_end,
    location: data.location,
    notes: data.notes,
    color: data.color,
  };

  if (data.capacity !== undefined) {
    scheduleData.capacity = data.capacity;
  }

  if (data.periodStart) {
    scheduleData.periodStart = new Date(data.periodStart);
  }
  if (data.periodEnd) {
    scheduleData.periodEnd = new Date(data.periodEnd);
  }

  // Handle relationship connections
  if (data.courseId) {
    scheduleData.course = { connect: { id: data.courseId } };
  }
  if (data.academicPeriodId) {
    scheduleData.period = { connect: { id: data.academicPeriodId } };
  }
  if (data.teacherId) {
    scheduleData.teacher = { connect: { id: data.teacherId } };
  }

  return prisma.schedule.update({
    where: { id: parseInt(id) },
    data: scheduleData,
    include: {
      course: {
        select: {
          id: true,
          name: true,
        },
      },
      period: {
        select: {
          id: true,
          batchName: true,
        },
      },
      teacher: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });
};

/**
 * Soft delete a schedule
 * @param {number} id - Schedule ID
 * @returns {Promise<Object>} Deleted schedule
 */
export const deleteSchedule = async (id) => {
  return prisma.schedule.update({
    where: { id: parseInt(id) },
    data: { deletedAt: new Date() },
  });
};

/**
 * Check for schedule conflicts
 * @param {Object} scheduleData - Schedule data to check
 * @param {number} excludeId - Schedule ID to exclude from check (for updates)
 * @returns {Promise<Array>} Array of conflicting schedules
 */
export const checkScheduleConflicts = async (
  scheduleData,
  excludeId = null
) => {
  const { teacherId, days, time_start, time_end, periodStart, periodEnd } =
    scheduleData;

  if (!teacherId || !days || !time_start || !time_end) {
    return [];
  }

  // Parse days array
  const daysArray = days.split(',').map((d) => d.trim());

  // Find schedules with same teacher and overlapping days
  const conflictingSchedules = await prisma.schedule.findMany({
    where: {
      teacherId,
      deletedAt: null,
      ...(excludeId ? { id: { not: parseInt(excludeId) } } : {}),
      days: {
        in: daysArray.map((day) => days), // This is a simplified check
      },
    },
    include: {
      course: {
        select: {
          name: true,
        },
      },
    },
  });

  // Filter for time and date overlaps
  return conflictingSchedules.filter((schedule) => {
    // Check if days overlap
    const scheduleDays = schedule.days.split(',').map((d) => d.trim());
    const daysOverlap = daysArray.some((day) => scheduleDays.includes(day));

    if (!daysOverlap) return false;

    // Check if time periods overlap
    const newStart = time_start;
    const newEnd = time_end;
    const existingStart = schedule.time_start;
    const existingEnd = schedule.time_end;

    const timeOverlap = newStart < existingEnd && newEnd > existingStart;

    if (!timeOverlap) return false;

    // Check if date ranges overlap
    if (
      periodStart &&
      periodEnd &&
      schedule.periodStart &&
      schedule.periodEnd
    ) {
      const newPeriodStart = new Date(periodStart);
      const newPeriodEnd = new Date(periodEnd);
      const existingPeriodStart = new Date(schedule.periodStart);
      const existingPeriodEnd = new Date(schedule.periodEnd);

      const dateOverlap =
        newPeriodStart <= existingPeriodEnd &&
        newPeriodEnd >= existingPeriodStart;
      return dateOverlap;
    }

    return true;
  });
};
