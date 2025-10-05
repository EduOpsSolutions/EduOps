// Example data structures for schedule events based on Prisma schema
// This file shows how to format schedule data from the database for use in the calendar components

/**
 * Example of schedule data from the database (Prisma schema)
 *
 * From schema.prisma:
 * model schedule {
 *   id        Int
 *   days      String      // e.g., "M,W,F" or "T,TH"
 *   time      String      // e.g., "10:00 AM - 11:00 AM"
 *   courseId  String?
 *   periodId  String?
 *   teacherId String?
 *   course    course?
 *   period    academic_period?
 *   teacher   users?
 * }
 */

/**
 * Transform database schedule to calendar event format
 * @param {Object} scheduleFromDB - Schedule object from database
 * @returns {Object} - Calendar event object
 */
export const transformScheduleToEvent = (scheduleFromDB) => {
  // Parse time string (assuming format "10:00 AM - 11:00 AM")
  const [time_start, time_end] = scheduleFromDB.time
    .split(' - ')
    .map((t) => t.trim());

  return {
    id: scheduleFromDB.id,
    title: scheduleFromDB.course?.name || 'Untitled Course',
    days: scheduleFromDB.days, // Already in correct format: "M,W,F" or "T,TH"
    time_start: time_start,
    time_end: time_end,
    color: generateColorForCourse(scheduleFromDB.courseId), // Custom color logic
    courseId: scheduleFromDB.courseId,
    periodId: scheduleFromDB.periodId,
    teacherId: scheduleFromDB.teacherId,
    teacher:
      scheduleFromDB.teacher?.firstName +
      ' ' +
      scheduleFromDB.teacher?.lastName,
    // Academic period date range - IMPORTANT for recurring logic
    periodStart: scheduleFromDB.period?.startAt,
    periodEnd: scheduleFromDB.period?.endAt,
    periodName: scheduleFromDB.period?.periodName,
  };
};

/**
 * Generate a consistent color for a course
 * @param {string} courseId - Course ID
 * @returns {string} - Hex color
 */
const generateColorForCourse = (courseId) => {
  const colors = [
    '#FFCF00', // Yellow
    '#0099FF', // Blue
    '#29CC6A', // Green
    '#FF6B6B', // Red
    '#9B59B6', // Purple
    '#F39C12', // Orange
    '#1ABC9C', // Turquoise
    '#E74C3C', // Dark Red
  ];

  // Simple hash function for consistent color assignment
  const hash = courseId
    ? courseId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    : 0;
  return colors[hash % colors.length];
};

/**
 * Example usage with API data
 */
export const exampleAPIResponse = {
  schedules: [
    {
      id: 1,
      days: 'M,W',
      time: '10:00 AM - 11:00 AM',
      courseId: 'course_123',
      periodId: 'period_456',
      teacherId: 'teacher_789',
      course: {
        name: 'A1: Basic German Course',
        description: 'Introduction to German language',
      },
      teacher: {
        firstName: 'John',
        lastName: 'Doe',
      },
      period: {
        id: 'period_456',
        periodName: 'Fall 2025',
        batchName: 'Batch A',
        startAt: '2025-09-01T00:00:00.000Z',
        endAt: '2025-12-15T23:59:59.999Z',
        status: 'ongoing',
      },
    },
    {
      id: 2,
      days: 'T,TH',
      time: '1:30 PM - 2:30 PM',
      courseId: 'course_456',
      periodId: 'period_456',
      teacherId: 'teacher_789',
      course: {
        name: 'A2: Intermediate German Course',
        description: 'Continuing German language studies',
      },
      teacher: {
        firstName: 'Jane',
        lastName: 'Smith',
      },
      period: {
        id: 'period_456',
        periodName: 'Fall 2025',
        batchName: 'Batch A',
        startAt: '2025-09-01T00:00:00.000Z',
        endAt: '2025-12-15T23:59:59.999Z',
        status: 'ongoing',
      },
    },
    {
      id: 3,
      days: 'M,W,F',
      time: '3:00 PM - 4:00 PM',
      courseId: 'course_789',
      periodId: 'period_456',
      teacherId: 'teacher_101',
      course: {
        name: 'B1: Advanced German Course',
        description: 'Advanced German language studies',
      },
      teacher: {
        firstName: 'Bob',
        lastName: 'Johnson',
      },
      period: {
        id: 'period_456',
        periodName: 'Fall 2025',
        batchName: 'Batch A',
        startAt: '2025-09-01T00:00:00.000Z',
        endAt: '2025-12-15T23:59:59.999Z',
        status: 'ongoing',
      },
    },
  ],
};

/**
 * Transform API response to calendar events
 */
export const transformSchedulesForCalendar = (apiResponse) => {
  return apiResponse.schedules.map((schedule) =>
    transformScheduleToEvent(schedule)
  );
};

/**
 * Example of transformed events ready for Calendar component
 */
export const exampleCalendarEvents =
  transformSchedulesForCalendar(exampleAPIResponse);

// Day abbreviation reference for database storage:
// SU = Sunday
// M = Monday
// T = Tuesday
// W = Wednesday
// TH = Thursday
// F = Friday
// S = Saturday

// Multiple days should be comma-separated: "M,W,F" or "T,TH"
