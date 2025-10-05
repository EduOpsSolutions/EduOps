import * as ScheduleModel from '../model/schedule_model.js';
import { PrismaClient } from '@prisma/client';
import { verifyJWT } from '../utils/jwt.js';
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
      courseId: schedule.course?.id || '',
      courseName: schedule.course?.name || '',
      academicPeriodId: schedule.periodId,
      academicPeriodName: schedule.period
        ? `${schedule.period.periodName}${
            schedule.period.batchName ? ` - ${schedule.period.batchName}` : ''
          }`
        : '',
      teacherId: schedule.teacherId,
      teacherName: schedule.teacher
        ? `${schedule.teacher.firstName} ${schedule.teacher.lastName}`
        : '',
      location: schedule.location,
      days: schedule.days,
      time_start: schedule.time_start,
      time_end: schedule.time_end,
      periodStart: schedule.periodStart
        ? schedule.periodStart.toISOString().split('T')[0]
        : null,
      periodEnd: schedule.periodEnd
        ? schedule.periodEnd.toISOString().split('T')[0]
        : null,
      color: schedule.color || '#FFCF00',
      notes: schedule.notes,
      createdAt: schedule.createdAt,
      updatedAt: schedule.updatedAt,
    }));

    res.json(transformedSchedules);
  } catch (err) {
    console.error('Get schedules error:', err);
    res.status(500).json({
      error: true,
      message: 'Failed to get schedules',
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
        message: 'Schedule not found',
      });
    }

    // Transform the data
    const transformedSchedule = {
      id: schedule.id,
      courseId: schedule.course,
      courseName: schedule.course?.name || '',
      academicPeriodId: schedule.periodId,
      academicPeriodName: schedule.period
        ? `${schedule.period.periodName}${
            schedule.period.batchName ? ` - ${schedule.period.batchName}` : ''
          }`
        : '',
      teacherId: schedule.teacherId,
      teacherName: schedule.teacher
        ? `${schedule.teacher.firstName} ${schedule.teacher.lastName}`
        : '',
      location: schedule.location,
      days: schedule.days,
      time_start: schedule.time_start,
      time_end: schedule.time_end,
      periodStart: schedule.periodStart
        ? schedule.periodStart.toISOString().split('T')[0]
        : null,
      periodEnd: schedule.periodEnd
        ? schedule.periodEnd.toISOString().split('T')[0]
        : null,
      color: schedule.color || '#FFCF00',
      notes: schedule.notes,
      createdAt: schedule.createdAt,
      updatedAt: schedule.updatedAt,
    };

    res.json(transformedSchedule);
  } catch (err) {
    console.error('Get schedule error:', err);
    res.status(500).json({
      error: true,
      message: 'Failed to get schedule',
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
    console.error('Get schedules by period error:', err);
    res.status(500).json({
      error: true,
      message: 'Failed to get schedules',
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
    console.error('Get schedules by teacher error:', err);
    res.status(500).json({
      error: true,
      message: 'Failed to get schedules',
    });
  }
};

/**
 * Get schedules for the logged-in student
 */
export const getMySchedules = async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = await verifyJWT(token);
    if (!decoded.payload.data.id) {
      return res.status(401).json({ error: true, message: 'Unauthorized' });
    }

    const schedules = await ScheduleModel.getSchedulesByStudent(
      decoded.payload.data.id
    );

    // Transform to match frontend shape used elsewhere
    const transformed = schedules.map((schedule) => ({
      id: schedule.id,
      courseId: schedule.course?.id || '',
      courseName: schedule.course?.name || '',
      academicPeriodId: schedule.period?.id || schedule.periodId,
      academicPeriodName: schedule.period
        ? `${schedule.period.periodName}${
            schedule.period.batchName ? ` - ${schedule.period.batchName}` : ''
          }`
        : '',
      teacherId: schedule.teacher?.id || schedule.teacherId,
      teacherName: schedule.teacher
        ? `${schedule.teacher.firstName} ${schedule.teacher.lastName}`
        : '',
      location: schedule.location,
      days: schedule.days,
      time_start: schedule.time_start,
      time_end: schedule.time_end,
      periodStart: schedule.periodStart
        ? schedule.periodStart.toISOString().split('T')[0]
        : null,
      periodEnd: schedule.periodEnd
        ? schedule.periodEnd.toISOString().split('T')[0]
        : null,
      color: schedule.color || '#FFCF00',
      notes: schedule.notes,
      createdAt: schedule.createdAt,
      updatedAt: schedule.updatedAt,
    }));

    return res.json(transformed);
  } catch (err) {
    console.error('Get my schedules error:', err);
    return res
      .status(500)
      .json({ error: true, message: 'Failed to get schedules' });
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
        .json({ error: true, message: 'Invalid schedule id' });
    }

    const token = req.headers.authorization?.split(' ')[1];
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
        .json({ error: true, message: 'Schedule not found' });
    }

    // If student, ensure they are enrolled in this schedule
    if (role === 'student') {
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
          .json({ error: true, message: 'User is unauthorized' });
      }
    }

    const userSchedules = await prisma.user_schedule.findMany({
      where: {
        scheduleId,
        deletedAt: null,
        user: { deletedAt: null, role: 'student' },
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
      orderBy: { createdAt: 'desc' },
    });

    const students = userSchedules
      .map((us) => us.user)
      .filter(Boolean)
      .map((s) => ({
        ...s,
        name: `${s.firstName}${s.middleName ? ' ' + s.middleName : ''} ${
          s.lastName
        }`.trim(),
      }));

    return res.json(students);
  } catch (err) {
    console.error('getScheduleStudents error:', err);
    return res
      .status(500)
      .json({ error: true, message: 'Failed to fetch students' });
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
        message: 'Schedule conflict detected',
        conflicts: conflicts.map((c) => ({
          id: c.id,
          courseName: c.course?.name,
          days: c.days,
          time_start: c.time_start,
          time_end: c.time_end,
        })),
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
    };

    const schedule = await ScheduleModel.createSchedule(body);

    // Transform the response
    const transformedSchedule = {
      id: schedule.id,
      course: schedule.courseId,
      courseName: schedule.course?.name || '',
      academicPeriodId: schedule.periodId,
      teacherId: schedule.teacherId,
      teacherName: schedule.teacher
        ? `${schedule.teacher.firstName} ${schedule.teacher.lastName}`
        : '',
      location: schedule.location,
      days: schedule.days,
      time_start: schedule.time_start,
      time_end: schedule.time_end,
      periodStart: schedule.periodStart
        ? schedule.periodStart.toISOString().split('T')[0]
        : null,
      periodEnd: schedule.periodEnd
        ? schedule.periodEnd.toISOString().split('T')[0]
        : null,
      color: schedule.color || '#FFCF00',
      notes: schedule.notes,
    };

    res.status(201).json(transformedSchedule);
  } catch (err) {
    console.error('Create schedule error:', err);
    res.status(500).json({
      error: true,
      message: 'Failed to create schedule',
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
        message: 'Schedule not found',
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
          message: 'Schedule conflict detected',
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

    const schedule = await ScheduleModel.updateSchedule(
      req.params.id,
      req.body
    );

    // Transform the response
    const transformedSchedule = {
      id: schedule.id,
      course: schedule.courseId,
      courseName: schedule.course?.name || '',
      academicPeriodId: schedule.periodId,
      teacherId: schedule.teacherId,
      teacherName: schedule.teacher
        ? `${schedule.teacher.firstName} ${schedule.teacher.lastName}`
        : '',
      location: schedule.location,
      days: schedule.days,
      time_start: schedule.time_start,
      time_end: schedule.time_end,
      periodStart: schedule.periodStart
        ? schedule.periodStart.toISOString().split('T')[0]
        : null,
      periodEnd: schedule.periodEnd
        ? schedule.periodEnd.toISOString().split('T')[0]
        : null,
      color: schedule.color || '#FFCF00',
      notes: schedule.notes,
    };

    res.json(transformedSchedule);
  } catch (err) {
    console.error('Update schedule error:', err);
    res.status(500).json({
      error: true,
      message: 'Failed to update schedule',
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
        message: 'Schedule not found',
      });
    }

    await ScheduleModel.deleteSchedule(req.params.id);

    res.json({
      success: true,
      message: 'Schedule deleted successfully',
    });
  } catch (err) {
    console.error('Delete schedule error:', err);
    res.status(500).json({
      error: true,
      message: 'Failed to delete schedule',
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
        message: 'scheduleId (param) and userId (body) are required',
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
        .json({ error: true, message: 'Schedule not found' });
    }

    // Ensure user exists and is a student
    const user = await prisma.users.findFirst({
      where: { id: userId, role: 'student', deletedAt: null },
      select: { id: true },
    });
    if (!user) {
      return res
        .status(404)
        .json({ error: true, message: 'Student not found' });
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
    console.error('addStudentToSchedule error:', err);
    return res
      .status(500)
      .json({ error: true, message: 'Failed to add student to schedule' });
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
        message: 'scheduleId (param) and userIds[] (body) are required',
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
        .json({ error: true, message: 'Schedule not found' });
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
    console.error('removeStudentsFromSchedule error:', err);
    return res.status(500).json({
      error: true,
      message: 'Failed to remove students from schedule',
    });
  }
};
