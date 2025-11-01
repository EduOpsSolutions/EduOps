import Joi from 'joi';

/**
 * Schema for creating a schedule
 */
const createScheduleSchema = Joi.object({
  courseId: Joi.string().required().messages({
    'any.required': 'Course is required',
    'string.empty': 'Course is required',
  }),
  academicPeriodId: Joi.string().required().messages({
    'any.required': 'Academic period is required',
    'string.empty': 'Academic period is required',
  }),
  teacherId: Joi.string().required().messages({
    'any.required': 'Teacher/Organizer is required',
    'string.empty': 'Teacher/Organizer is required',
  }),
  location: Joi.string().required().messages({
    'any.required': 'Location is required',
    'string.empty': 'Location is required',
  }),
  days: Joi.string()
    .required()
    .pattern(/^(M|T|W|TH|F|S|SU)(,(M|T|W|TH|F|S|SU))*$/)
    .messages({
      'any.required': 'Days are required',
      'string.pattern.base': 'Days must be in format: M,W,F or T,TH',
    }),
  time_start: Joi.string().required().messages({
    'any.required': 'Start time is required',
    'string.empty': 'Start time is required',
  }),
  time_end: Joi.string().required().messages({
    'any.required': 'End time is required',
    'string.empty': 'End time is required',
  }),
  periodStart: Joi.date().iso().required().messages({
    'any.required': 'Schedule start date is required',
    'date.format': 'Invalid start date format',
  }),
  periodEnd: Joi.date()
    .iso()
    .required()
    .greater(Joi.ref('periodStart'))
    .messages({
      'any.required': 'Schedule end date is required',
      'date.format': 'Invalid end date format',
      'date.greater': 'End date must be after start date',
    }),
  color: Joi.string()
    .pattern(/^#[0-9A-F]{6}$/i)
    .default('#FFCF00')
    .messages({
      'string.pattern.base': 'Color must be a valid hex code',
    }),
  notes: Joi.string().allow('', null).optional(),
  time: Joi.string().allow('', null).optional(), // For backward compatibility
});

/**
 * Schema for updating a schedule
 */
const updateScheduleSchema = Joi.object({
  courseId: Joi.string().optional(),
  periodId: Joi.string().optional(),
  teacherId: Joi.string().optional(),
  location: Joi.string().optional(),
  days: Joi.string()
    .optional()
    .pattern(/^(M|T|W|TH|F|S|SU)(,(M|T|W|TH|F|S|SU))*$/)
    .messages({
      'string.pattern.base': 'Days must be in format: M,W,F or T,TH',
    }),
  time_start: Joi.string().optional(),
  time_end: Joi.string().optional(),
  periodStart: Joi.date().iso().optional(),
  periodEnd: Joi.date().iso().optional(),
  color: Joi.string()
    .pattern(/^#[0-9A-F]{6}$/i)
    .optional()
    .messages({
      'string.pattern.base': 'Color must be a valid hex code',
    }),
  notes: Joi.string().allow('', null).optional(),
  time: Joi.string().allow('', null).optional(),
}).min(1);

/**
 * Validate time constraints
 * - Start time must be before end time
 * - End time cannot be later than 9:00 PM (21:00)
 * - Minimum duration is 30 minutes
 */
const validateTimeConstraints = (req, res, next) => {
  const { time_start, time_end } = req.body;

  if (!time_start || !time_end) {
    // Skip validation if times are not provided (for partial updates)
    return next();
  }

  // Convert time strings to comparable format
  const parseTime = (timeStr) => {
    // Handle both 12-hour (10:00 AM) and 24-hour (10:00) formats
    const normalized = timeStr.trim();
    const isPM = normalized.toLowerCase().includes('pm');
    const isAM = normalized.toLowerCase().includes('am');
    const timeMatch = normalized.match(/(\d+):(\d+)/);

    if (!timeMatch) return null;

    let hour = parseInt(timeMatch[1], 10);
    const minute = parseInt(timeMatch[2], 10);

    // Convert to 24-hour format
    if (isPM && hour !== 12) {
      hour += 12;
    } else if (isAM && hour === 12) {
      hour = 0;
    }

    return hour * 60 + minute; // Return total minutes
  };

  const startMinutes = parseTime(time_start);
  const endMinutes = parseTime(time_end);

  if (startMinutes === null || endMinutes === null) {
    return res.status(400).json({
      error: true,
      message: 'Invalid time format',
    });
  }

  // Check start time is before end time
  if (startMinutes >= endMinutes) {
    return res.status(400).json({
      error: true,
      message: 'Start time must be before end time',
    });
  }

  // Check minimum duration (30 minutes)
  const durationMinutes = endMinutes - startMinutes;
  if (durationMinutes < 30) {
    return res.status(400).json({
      error: true,
      message: 'Schedule duration must be at least 30 minutes',
    });
  }

  // Check latest end time (9:00 PM = 21:00 = 1260 minutes)
  if (endMinutes > 21 * 60 + 1) {
    return res.status(400).json({
      error: true,
      message: 'Latest end time is 9:00 PM',
    });
  }

  next();
};

/**
 * Validate schedule dates are within academic period boundaries
 */
const validateDateBoundaries = async (req, res, next) => {
  const { periodId, periodStart, periodEnd } = req.body;

  if (!periodId || !periodStart || !periodEnd) {
    // Skip validation if not all required fields are present
    return next();
  }

  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    // Fetch the academic period
    const academicPeriod = await prisma.academic_period.findUnique({
      where: { id: periodId },
      select: { startAt: true, endAt: true },
    });

    if (!academicPeriod) {
      return res.status(404).json({
        error: true,
        message: 'Academic period not found',
      });
    }

    const scheduleStart = new Date(periodStart);
    const scheduleEnd = new Date(periodEnd);
    const periodStartDate = new Date(academicPeriod.startAt);
    const periodEndDate = new Date(academicPeriod.endAt);

    // Check if schedule dates are within academic period boundaries
    if (scheduleStart < periodStartDate || scheduleEnd > periodEndDate) {
      return res.status(400).json({
        error: true,
        message: `Schedule dates must be within the academic period range: ${periodStartDate.toLocaleDateString()} - ${periodEndDate.toLocaleDateString()}`,
      });
    }

    // Check schedule end is after start
    if (scheduleStart > scheduleEnd) {
      return res.status(400).json({
        error: true,
        message: 'Schedule end date must be after start date',
      });
    }

    await prisma.$disconnect();
    next();
  } catch (error) {
    console.error('Date validation error:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to validate schedule dates',
    });
  }
};

/**
 * Middleware to validate schedule creation
 */
export const validateCreateSchedule = (req, res, next) => {
  const { error } = createScheduleSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errors = error.details.map((detail) => detail.message);
    return res.status(400).json({
      error: true,
      message: `Validation failed: ${errors.join(', ')}`,
      details: errors,
    });
  }

  next();
};

/**
 * Middleware to validate schedule update
 */
export const validateUpdateSchedule = (req, res, next) => {
  const { error } = updateScheduleSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const details = error.details.map((detail) => detail.message);
    return res.status(400).json({
      error: true,
      message: details.join(', '),
      details: details,
    });
  }

  next();
};

export { validateTimeConstraints, validateDateBoundaries };
