import * as ScheduleModel from '../model/schedule_model.js';

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
