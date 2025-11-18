import * as ScheduleModel from "../model/schedule_model.js";
import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import { verifyJWT } from "../utils/jwt.js";
const prisma = new PrismaClient();

/**
 * Get all schedules
 * Returns schedules with course, period, and teacher information
 */
export const getSchedules = async (req, res) => {
  try {
    const schedules = await ScheduleModel.getAllSchedules({
      includeCourse: true,
      includePeriod: true,
      includeTeacher: true,
    });

    // Transform the data to match frontend expectations
    const transformedSchedules = schedules.map((schedule) => ({
      id: schedule.id,
      courseId: schedule.course?.id || "",
      courseName: schedule.course?.name || "",
      academicPeriodId: schedule.periodId,
      academicPeriodName: schedule.period
        ? `${schedule.period.batchName || ""}`
        : "",
      teacherId: schedule.teacherId,
      teacherName: schedule.teacher
        ? `${schedule.teacher.firstName} ${schedule.teacher.lastName}`
        : "",
      location: schedule.location,
      days: schedule.days,
      time_start: schedule.time_start,
      time_end: schedule.time_end,
      periodStart: schedule.periodStart
        ? schedule.periodStart.toISOString().split("T")[0]
        : null,
      periodEnd: schedule.periodEnd
        ? schedule.periodEnd.toISOString().split("T")[0]
        : null,
      color: schedule.color || "#FFCF00",
      notes: schedule.notes,
      capacity: schedule.capacity,
      createdAt: schedule.createdAt,
      updatedAt: schedule.updatedAt,
    }));

    res.json(transformedSchedules);
  } catch (err) {
    console.error("Get schedules error:", err);
    res.status(500).json({
      error: true,
      message: "Failed to get schedules",
    });
  }
};

/**
 * Get a single schedule by ID
 */
export const getSchedule = async (req, res) => {
  try {
    const schedule = await ScheduleModel.getScheduleById(req.params.id);

    if (!schedule) {
      return res.status(404).json({
        error: true,
        message: "Schedule not found",
      });
    }

    // Transform the data
    const transformedSchedule = {
      id: schedule.id,
      courseId: schedule.course?.id || schedule.courseId || "", //if given course with full schema then use id, use it, otherwise use courseId
      courseName: schedule.course?.name || "",
      academicPeriodId: schedule.periodId,
      academicPeriodName: schedule.period
        ? `${schedule.period.batchName || ""}`
        : "",
      teacherId: schedule.teacherId,
      teacherName: schedule.teacher
        ? `${schedule.teacher.firstName} ${schedule.teacher.lastName}`
        : "",
      location: schedule.location,
      days: schedule.days,
      time_start: schedule.time_start,
      time_end: schedule.time_end,
      periodStart: schedule.periodStart
        ? schedule.periodStart.toISOString().split("T")[0]
        : null,
      periodEnd: schedule.periodEnd
        ? schedule.periodEnd.toISOString().split("T")[0]
        : null,
      color: schedule.color || "#FFCF00",
      notes: schedule.notes,
      capacity: schedule.capacity,
      createdAt: schedule.createdAt,
      updatedAt: schedule.updatedAt,
    };

    res.json(transformedSchedule);
  } catch (err) {
    console.error("Get schedule error:", err);
    res.status(500).json({
      error: true,
      message: "Failed to get schedule",
    });
  }
};

/**
 * Get schedules by academic period
 */
export const getSchedulesByPeriod = async (req, res) => {
  try {
    const schedules = await ScheduleModel.getSchedulesByPeriod(
      req.params.periodId
    );
    res.json(schedules);
  } catch (err) {
    console.error("Get schedules by period error:", err);
    res.status(500).json({
      error: true,
      message: "Failed to get schedules",
    });
  }
};

/**
 * Get schedules by teacher
 */
export const getSchedulesByTeacher = async (req, res) => {
  try {
    const schedules = await ScheduleModel.getSchedulesByTeacher(
      req.params.teacherId
    );
    res.json(schedules);
  } catch (err) {
    console.error("Get schedules by teacher error:", err);
    res.status(500).json({
      error: true,
      message: "Failed to get schedules",
    });
  }
};

/**
 * Get schedules for the logged-in student
 */
export const getMySchedules = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = await verifyJWT(token);
    if (!decoded.payload.data.id) {
      return res.status(401).json({ error: true, message: "Unauthorized" });
    }

    const schedules = await ScheduleModel.getSchedulesByStudent(
      decoded.payload.data.id
    );

    // Transform to match frontend shape used elsewhere
    const transformed = schedules.map((schedule) => ({
      id: schedule.id,
      courseId: schedule.course?.id || "",
      courseName: schedule.course?.name || "",
      academicPeriodId: schedule.period?.id || schedule.periodId,
      academicPeriodName: schedule.period
        ? `${schedule.period.batchName || ""}`
        : "",
      teacherId: schedule.teacher?.id || schedule.teacherId,
      teacherName: schedule.teacher
        ? `${schedule.teacher.firstName} ${schedule.teacher.lastName}`
        : "",
      location: schedule.location,
      days: schedule.days,
      time_start: schedule.time_start,
      time_end: schedule.time_end,
      periodStart: schedule.periodStart
        ? schedule.periodStart.toISOString().split("T")[0]
        : null,
      periodEnd: schedule.periodEnd
        ? schedule.periodEnd.toISOString().split("T")[0]
        : null,
      color: schedule.color || "#FFCF00",
      notes: schedule.notes,
      capacity: schedule.capacity,
      createdAt: schedule.createdAt,
      updatedAt: schedule.updatedAt,
    }));

    return res.json(transformed);
  } catch (err) {
    console.error("Get my schedules error:", err);
    return res
      .status(500)
      .json({ error: true, message: "Failed to get schedules" });
  }
};

/**
 * Get schedules for the logged-in teacher
 */
export const getMyTeachingSchedules = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = await verifyJWT(token);
    if (!decoded.payload.data.id) {
      return res.status(401).json({ error: true, message: "Unauthorized" });
    }

    // Get the teacher's information
    const teacher = await prisma.users.findUnique({
      where: { id: decoded.payload.data.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!teacher) {
      return res.status(404).json({ error: true, message: "Teacher not found" });
    }

    const schedules = await ScheduleModel.getSchedulesByTeacher(
      decoded.payload.data.id
    );

    // Get student counts for each schedule
    const schedulesWithCounts = await Promise.all(
      schedules.map(async (schedule) => {
        const studentCount = await prisma.user_schedule.count({
          where: {
            scheduleId: schedule.id,
            deletedAt: null,
          },
        });

        return {
          id: schedule.id,
          courseId: schedule.course?.id || "",
          courseName: schedule.course?.name || "",
          academicPeriodId: schedule.period?.id || schedule.periodId,
          academicPeriodName: schedule.period
            ? `${schedule.period.batchName || ""}`
            : "",
          teacherId: decoded.payload.data.id,
          teacherName: `${teacher.firstName} ${teacher.lastName}`,
          location: schedule.location,
          days: schedule.days,
          time_start: schedule.time_start,
          time_end: schedule.time_end,
          periodStart: schedule.periodStart
            ? schedule.periodStart.toISOString().split("T")[0]
            : null,
          periodEnd: schedule.periodEnd
            ? schedule.periodEnd.toISOString().split("T")[0]
            : null,
          color: schedule.color || "#FFCF00",
          notes: schedule.notes,
          capacity: schedule.capacity,
          studentCount: studentCount,
          createdAt: schedule.createdAt,
          updatedAt: schedule.updatedAt,
        };
      })
    );

    return res.json(schedulesWithCounts);
  } catch (err) {
    console.error("Get my teaching schedules error:", err);
    return res
      .status(500)
      .json({ error: true, message: "Failed to get teaching schedules" });
  }
};

/**
 * Get students enrolled in a schedule (read-only)
 * Admins/teachers can view any schedule's students.
 * Students can only view if they are enrolled in the schedule.
 */
export const getScheduleStudents = async (req, res) => {
  try {
    const scheduleId = parseInt(req.params.id, 10);
    if (!scheduleId) {
      return res
        .status(400)
        .json({ error: true, message: "Invalid schedule id" });
    }

    const token = req.headers.authorization?.split(" ")[1];
    const decoded = await verifyJWT(token);
    const role = decoded?.payload?.data?.role;
    const userId = decoded?.payload?.data?.id;

    // Verify schedule exists
    const schedule = await prisma.schedule.findFirst({
      where: { id: scheduleId, deletedAt: null },
      select: { id: true },
    });
    if (!schedule) {
      return res
        .status(404)
        .json({ error: true, message: "Schedule not found" });
    }

    // If student, ensure they are enrolled in this schedule
    if (role === "student") {
      const isEnrolled = await prisma.user_schedule.findFirst({
        where: {
          scheduleId,
          userId,
          deletedAt: null,
        },
        select: { id: true },
      });
      if (!isEnrolled) {
        return res
          .status(403)
          .json({ error: true, message: "User is unauthorized" });
      }
    }

    const userSchedules = await prisma.user_schedule.findMany({
      where: {
        scheduleId,
        deletedAt: null,
        user: { deletedAt: null, role: "student" },
      },
      include: {
        user: {
          select: {
            id: true,
            userId: true,
            firstName: true,
            middleName: true,
            lastName: true,
            email: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const students = userSchedules
      .map((us) => us.user)
      .filter(Boolean)
      .map((s) => ({
        ...s,
        name: `${s.firstName}${s.middleName ? " " + s.middleName : ""} ${
          s.lastName
        }`.trim(),
      }));

    return res.json(students);
  } catch (err) {
    console.error("getScheduleStudents error:", err);
    return res
      .status(500)
      .json({ error: true, message: "Failed to fetch students" });
  }
};

/**
 * Create a new schedule
 * Only admins can create schedules
 */
export const createSchedule = async (req, res) => {
  try {
    // Check for schedule conflicts
    const conflicts = await ScheduleModel.checkScheduleConflicts(req.body);

    if (conflicts.length > 0) {
      return res.status(409).json({
        error: true,
        message: "Schedule conflict detected",
        conflicts: conflicts.map((c) => ({
          id: c.id,
          courseName: c.course?.name,
          days: c.days,
          time_start: c.time_start,
          time_end: c.time_end,
        })),
      });
    }

    // Validate capacity
    const capacity =
      req.body.capacity !== undefined ? parseInt(req.body.capacity, 10) : 30;
    if (isNaN(capacity) || capacity < 0 || capacity > 100) {
      return res.status(400).json({
        error: true,
        message: "Capacity must be between 0 and 100",
      });
    }

    const body = {
      courseId: req.body.courseId,
      academicPeriodId: req.body.academicPeriodId,
      teacherId: req.body.teacherId,
      location: req.body.location,
      days: req.body.days,
      time_start: req.body.time_start,
      time_end: req.body.time_end,
      periodStart: req.body.periodStart,
      periodEnd: req.body.periodEnd,
      color: req.body.color,
      notes: req.body.notes,
      capacity: capacity,
    };

    const schedule = await ScheduleModel.createSchedule(body);

    // Transform the response
    const transformedSchedule = {
      id: schedule.id,
      course: schedule.courseId,
      courseName: schedule.course?.name || "",
      academicPeriodId: schedule.periodId,
      teacherId: schedule.teacherId,
      teacherName: schedule.teacher
        ? `${schedule.teacher.firstName} ${schedule.teacher.lastName}`
        : "",
      location: schedule.location,
      days: schedule.days,
      time_start: schedule.time_start,
      time_end: schedule.time_end,
      periodStart: schedule.periodStart
        ? schedule.periodStart.toISOString().split("T")[0]
        : null,
      periodEnd: schedule.periodEnd
        ? schedule.periodEnd.toISOString().split("T")[0]
        : null,
      color: schedule.color || "#FFCF00",
      notes: schedule.notes,
      capacity: schedule.capacity,
    };

    res.status(201).json(transformedSchedule);
  } catch (err) {
    console.error("Create schedule error:", err);
    res.status(500).json({
      error: true,
      message: "Failed to create schedule",
      details: err.message,
    });
  }
};

/**
 * Update a schedule
 * Only admins can update schedules
 */
export const updateSchedule = async (req, res) => {
  try {
    // Check if schedule exists
    const existingSchedule = await ScheduleModel.getScheduleById(req.params.id);

    if (!existingSchedule) {
      return res.status(404).json({
        error: true,
        message: "Schedule not found",
      });
    }

    // Check for schedule conflicts (excluding current schedule)
    if (req.body.teacherId || req.body.days || req.body.time_start) {
      const conflicts = await ScheduleModel.checkScheduleConflicts(
        {
          ...existingSchedule,
          ...req.body,
        },
        req.params.id
      );

      if (conflicts.length > 0) {
        return res.status(409).json({
          error: true,
          message: "Schedule conflict detected",
          conflicts: conflicts.map((c) => ({
            id: c.id,
            courseName: c.course?.name,
            days: c.days,
            time_start: c.time_start,
            time_end: c.time_end,
          })),
        });
      }
    }
    // Parse and validate capacity if provided
    const updateData = { ...req.body };
    if (req.body.capacity !== undefined) {
      const capacity = parseInt(req.body.capacity, 10);
      if (isNaN(capacity) || capacity < 0 || capacity > 100) {
        return res.status(400).json({
          error: true,
          message: "Capacity must be between 0 and 100",
        });
      }

      const count = await prisma.user_schedule.count({
        where: { scheduleId: parseInt(req.params.id, 10), deletedAt: null },
      });

      if (capacity < count) {
        return res.status(400).json({
          error: true,
          message: `Cannot reduce capacity below current enrollment count of ${count}`,
        });
      }

      // Update the capacity with parsed integer value
      updateData.capacity = capacity;
    }

    const schedule = await ScheduleModel.updateSchedule(
      req.params.id,
      updateData
    );

    // Transform the response
    const transformedSchedule = {
      id: schedule.id,
      course: schedule.courseId,
      courseName: schedule.course?.name || "",
      academicPeriodId: schedule.periodId,
      teacherId: schedule.teacherId,
      teacherName: schedule.teacher
        ? `${schedule.teacher.firstName} ${schedule.teacher.lastName}`
        : "",
      location: schedule.location,
      days: schedule.days,
      time_start: schedule.time_start,
      time_end: schedule.time_end,
      periodStart: schedule.periodStart
        ? schedule.periodStart.toISOString().split("T")[0]
        : null,
      periodEnd: schedule.periodEnd
        ? schedule.periodEnd.toISOString().split("T")[0]
        : null,
      color: schedule.color || "#FFCF00",
      notes: schedule.notes,
      capacity: schedule.capacity,
      createdAt: schedule.createdAt,
      updatedAt: schedule.updatedAt,
      deletedAt: schedule.deletedAt,
    };

    res.json(transformedSchedule);
  } catch (err) {
    console.error("Update schedule error:", err);
    res.status(500).json({
      error: true,
      message: "Failed to update schedule",
      details: err.message,
    });
  }
};

/**
 * Delete a schedule (soft delete)
 * Only admins can delete schedules
 */
export const deleteSchedule = async (req, res) => {
  try {
    const schedule = await ScheduleModel.getScheduleById(req.params.id);

    if (!schedule) {
      return res.status(404).json({
        error: true,
        message: "Schedule not found",
      });
    }

    await ScheduleModel.deleteSchedule(req.params.id);

    res.json({
      success: true,
      message: "Schedule deleted successfully",
    });
  } catch (err) {
    console.error("Delete schedule error:", err);
    res.status(500).json({
      error: true,
      message: "Failed to delete schedule",
    });
  }
};

/**
 * Attach a student to a schedule (user_schedule)
 */
export const addStudentToSchedule = async (req, res) => {
  try {
    const scheduleId = parseInt(req.params.id, 10);
    const { userId } = req.body;

    if (!scheduleId || !userId) {
      return res.status(400).json({
        error: true,
        message: "scheduleId (param) and userId (body) are required",
      });
    }

    // Ensure schedule exists and not deleted
    const schedule = await prisma.schedule.findFirst({
      where: { id: scheduleId, deletedAt: null },
      select: { id: true, capacity: true },
    });
    if (!schedule) {
      return res
        .status(404)
        .json({ error: true, message: "Schedule not found" });
    }

    // Check capacity
    const count = await prisma.user_schedule.count({
      where: { scheduleId, deletedAt: null },
    });

    if (count >= schedule.capacity) {
      return res
        .status(400)
        .json({ error: true, message: "Schedule capacity is full" });
    }

    // Ensure user exists and is a student
    const user = await prisma.users.findFirst({
      where: { id: userId, role: "student", deletedAt: null },
      select: { id: true },
    });
    if (!user) {
      return res
        .status(404)
        .json({ error: true, message: "Student not found" });
    }

    // Check if link exists (not deleted)
    const existing = await prisma.user_schedule.findFirst({
      where: { userId, scheduleId, deletedAt: null },
      select: { id: true },
    });
    if (existing) {
      return res.json({ success: true, alreadyLinked: true });
    }

    // If link exists but deleted, restore it; else create new
    const softDeleted = await prisma.user_schedule.findFirst({
      where: { userId, scheduleId, deletedAt: { not: null } },
      select: { id: true },
    });

    if (softDeleted) {
      await prisma.user_schedule.update({
        where: { id: softDeleted.id },
        data: { deletedAt: null },
      });
      return res.status(201).json({ success: true, restored: true });
    }

    await prisma.user_schedule.create({
      data: { userId, scheduleId },
    });
    return res.status(201).json({ success: true, created: true });
  } catch (err) {
    console.error("addStudentToSchedule error:", err);
    return res
      .status(500)
      .json({ error: true, message: "Failed to add student to schedule" });
  }
};

/**
 * Batch remove students from a schedule (soft delete user_schedule rows)
 */
export const removeStudentsFromSchedule = async (req, res) => {
  try {
    const scheduleId = parseInt(req.params.id, 10);
    const { userIds } = req.body;

    if (!scheduleId || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        error: true,
        message: "scheduleId (param) and userIds[] (body) are required",
      });
    }

    // Ensure schedule exists and not deleted
    const schedule = await prisma.schedule.findFirst({
      where: { id: scheduleId, deletedAt: null },
      select: { id: true },
    });
    if (!schedule) {
      return res
        .status(404)
        .json({ error: true, message: "Schedule not found" });
    }

    // Soft delete links
    const result = await prisma.user_schedule.updateMany({
      where: {
        scheduleId,
        userId: { in: userIds },
        deletedAt: null,
      },
      data: { deletedAt: new Date() },
    });

    return res.json({ success: true, count: result.count });
  } catch (err) {
    console.error("removeStudentsFromSchedule error:", err);
    return res.status(500).json({
      error: true,
      message: "Failed to remove students from schedule",
    });
  }
};

/**
 * Validate bulk student IDs from CSV
 * POST /api/v1/schedules/:id/students:validate-bulk
 * Body: { userIds: string[], days, time_start, time_end, periodId }
 */
export const validateBulkStudents = async (req, res) => {
  try {
    const scheduleId = parseInt(req.params.id, 10);
    const { userIds, days, time_start, time_end, periodId } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        error: true,
        message: "userIds array is required",
      });
    }

    // Fetch users by userId (not id)
    const users = await prisma.users.findMany({
      where: {
        userId: { in: userIds },
        deletedAt: null,
      },
      select: {
        id: true,
        userId: true,
        firstName: true,
        middleName: true,
        lastName: true,
        email: true,
        role: true,
      },
    });

    const approved = [];
    const rejected = [];
    const conflicts = [];

    // Fetch all currently enrolled students in this schedule (optimization)
    const enrolledStudents = await prisma.user_schedule.findMany({
      where: {
        scheduleId,
        deletedAt: null,
      },
      select: {
        userId: true,
      },
    });
    const enrolledUserIds = new Set(enrolledStudents.map((es) => es.userId));

    // Check each userId
    for (const userId of userIds) {
      const user = users.find((u) => u.userId === userId);

      // User not found
      if (!user) {
        rejected.push({
          userId,
          reason: "User not found",
        });
        continue;
      }

      // User is not a student
      if (user.role.toLowerCase() !== "student") {
        rejected.push({
          userId,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          reason: `Incompatible role: ${user.role.toLowerCase()}`,
        });
        continue;
      }

      // Check if already enrolled in this schedule
      if (enrolledUserIds.has(user.id)) {
        rejected.push({
          userId,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          reason: "Already enrolled in this schedule",
        });
        continue;
      }

      // Check for schedule conflicts if schedule details provided
      let hasConflict = false;
      let conflictDetails = null;

      if (days && time_start && time_end && periodId) {
        try {
          const conflictResp = await prisma.$queryRaw`
            SELECT s.id, c.name as courseName, s.days, s.time_start, s.time_end
            FROM user_schedule us
            JOIN schedule s ON us.scheduleId = s.id
            JOIN course c ON s.courseId = c.id
            WHERE us.userId = ${user.id}
              AND us.deletedAt IS NULL
              AND s.deletedAt IS NULL
              AND s.periodId = ${periodId}
              AND s.id != ${scheduleId}
          `;

          for (const existingSchedule of conflictResp) {
            const existingDays = String(existingSchedule.days)
              .split(",")
              .map((d) => d.trim());
            const newDays = String(days)
              .split(",")
              .map((d) => d.trim());
            const hasOverlappingDays = existingDays.some((d) =>
              newDays.includes(d)
            );

            if (hasOverlappingDays) {
              const [sh, sm] = String(time_start).split(":").map(Number);
              const [eh, em] = String(time_end).split(":").map(Number);
              const [esh, esm] = String(existingSchedule.time_start)
                .split(":")
                .map(Number);
              const [eeh, eem] = String(existingSchedule.time_end)
                .split(":")
                .map(Number);

              const newStart = sh * 60 + sm;
              const newEnd = eh * 60 + em;
              const existingStart = esh * 60 + esm;
              const existingEnd = eeh * 60 + eem;

              if (newStart < existingEnd && newEnd > existingStart) {
                hasConflict = true;
                conflictDetails = {
                  courseName: existingSchedule.courseName,
                  days: existingSchedule.days,
                  time: `${existingSchedule.time_start} - ${existingSchedule.time_end}`,
                };
                break;
              }
            }
          }
        } catch (error) {
          console.error("Error checking conflicts:", error);
        }
      }

      const studentData = {
        userId: user.userId,
        name: `${user.firstName}${
          user.middleName ? " " + user.middleName : ""
        } ${user.lastName}`,
        email: user.email,
        dbId: user.id,
      };

      if (hasConflict) {
        conflicts.push({
          ...studentData,
          conflict: conflictDetails,
        });
      } else {
        approved.push(studentData);
      }
    }

    return res.json({
      success: true,
      approved,
      rejected,
      conflicts,
      summary: {
        total: approved.length + conflicts.length, // Only count students that can be added
        approved: approved.length,
        rejected: rejected.length,
        conflicts: conflicts.length,
      },
    });
  } catch (err) {
    console.error("validateBulkStudents error:", err);
    return res.status(500).json({
      error: true,
      message: "Failed to validate bulk students",
    });
  }
};

/**
 * Bulk add students to schedule
 * POST /api/v1/schedules/:id/students:bulk-add
 * Body: { userIds: number[] } - array of user database IDs
 */
export const bulkAddStudentsToSchedule = async (req, res) => {
  try {
    const scheduleId = parseInt(req.params.id, 10);
    const { userIds } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        error: true,
        message: "userIds array is required",
      });
    }

    // Remove duplicates from userIds array
    const uniqueUserIds = [...new Set(userIds)];

    // Log if duplicates were removed
    if (uniqueUserIds.length !== userIds.length) {
      console.log(`Removed ${userIds.length - uniqueUserIds.length} duplicate user ID(s) in bulk-add request`);
    }

    // Ensure schedule exists
    const schedule = await prisma.schedule.findFirst({
      where: { id: scheduleId, deletedAt: null },
      select: { id: true, capacity: true },
    });

    if (!schedule) {
      return res.status(404).json({
        error: true,
        message: "Schedule not found",
      });
    }

    // Check capacity
    const currentCount = await prisma.user_schedule.count({
      where: { scheduleId, deletedAt: null },
    });

    const availableSlots = schedule.capacity - currentCount;
    if (availableSlots < uniqueUserIds.length) {
      return res.status(400).json({
        error: true,
        message: `Not enough capacity. Available: ${availableSlots}, Requested: ${uniqueUserIds.length}`,
      });
    }

    // Get existing enrollments to avoid duplicates
    const existing = await prisma.user_schedule.findMany({
      where: {
        scheduleId,
        userId: { in: uniqueUserIds },
      },
      select: { userId: true, deletedAt: true },
    });

    const existingMap = new Map(existing.map((e) => [e.userId, e.deletedAt]));
    const toCreate = [];
    const toRestore = [];

    for (const userId of uniqueUserIds) {
      const deletedAt = existingMap.get(userId);
      if (deletedAt === null) {
        // Already enrolled
        continue;
      } else if (deletedAt) {
        // Was deleted, restore it
        toRestore.push(userId);
      } else {
        // New enrollment
        toCreate.push({ scheduleId, userId });
      }
    }

    // Create new enrollments
    if (toCreate.length > 0) {
      await prisma.user_schedule.createMany({
        data: toCreate,
        skipDuplicates: true,
      });
    }

    // Restore soft-deleted enrollments
    if (toRestore.length > 0) {
      await prisma.user_schedule.updateMany({
        where: {
          scheduleId,
          userId: { in: toRestore },
        },
        data: { deletedAt: null },
      });
    }

    return res.json({
      success: true,
      added: toCreate.length + toRestore.length,
    });
  } catch (err) {
    console.error("bulkAddStudentsToSchedule error:", err);
    return res.status(500).json({
      error: true,
      message: "Failed to bulk add students",
    });
  }
};
