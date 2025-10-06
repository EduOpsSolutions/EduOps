import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SCHEMA_CONTEXT = `
Database Schema:
- schedule: id, days, time, time_start, time_end, location, notes, color, periodStart, periodEnd, courseId, periodId, teacherId
- course: id, name, description, maxNumber, visibility, price
- users: id, userId, firstName, lastName, email, role (student/teacher/admin)
- academic_period: id, batchName, status (upcoming/ongoing/ended), startAt, endAt
- user_schedule: links students to their schedules
- student_enrollment: studentId, periodId, status (enrolled/completed/dropped/withdrawn)

Relationships:
- Schedule belongs to course, academic_period, and teacher (users)
- Students enroll in academic periods and have schedules through user_schedule
`;

async function getSchedulingContext() {
  try {
    const context = {};

    // Get active academic periods (with IDs for resolution)
    const activePeriods = await prisma.academic_period.findMany({
      where: {
        deletedAt: null,
        status: { in: ['ongoing', 'upcoming'] },
      },
      select: {
        id: true,
        batchName: true,
        status: true,
        startAt: true,
        endAt: true,
      },
      take: 5,
    });
    context.academicPeriods = activePeriods;

    // Get visible courses (with IDs for resolution)
    const courses = await prisma.course.findMany({
      where: {
        deletedAt: null,
        visibility: 'visible',
      },
      select: {
        id: true,
        name: true,
        description: true,
        maxNumber: true,
      },
      take: 20,
    });
    context.courses = courses;

    // Get recent schedules
    const schedules = await prisma.schedule.findMany({
      where: {
        deletedAt: null,
      },
      select: {
        days: true,
        time: true,
        time_start: true,
        time_end: true,
        location: true,
        notes: true,
        periodStart: true,
        periodEnd: true,
        course: {
          select: { name: true },
        },
        teacher: {
          select: { firstName: true, lastName: true },
        },
        period: {
          select: { batchName: true, status: true },
        },
      },
      take: 30,
    });
    context.schedules = schedules;

    return context;
  } catch (error) {
    console.error('Error fetching scheduling context:', error);
    return {};
  }
}

const gemini_api_key = process.env.GEMINI_API_KEY;
const googleAI = new GoogleGenerativeAI(gemini_api_key);
const geminiConfig = {
  temperature: 0.9,
  topP: 1,
  topK: 1,
  maxOutputTokens: 4096,
};

const geminiModel = googleAI.getGenerativeModel({
  model: 'gemini-2.0-flash-exp',
  generationConfig: geminiConfig,
});

export const askGemini = async (req, res) => {
  try {
    const apiKey = (process.env.GEMINI_API_KEY || '').trim();
    if (!apiKey) {
      return res
        .status(500)
        .json({ error: true, message: 'GEMINI_API_KEY is missing' });
    }

    const { prompt, context, history } = req.body || {};
    if (!prompt || typeof prompt !== 'string') {
      return res
        .status(400)
        .json({ error: true, message: 'prompt is required' });
    }

    // Fetch database context
    const dbContext = await getSchedulingContext();

    // Prepare data for AI (remove IDs)
    const aiContext = {
      academicPeriods: dbContext.academicPeriods?.map(({ id, ...rest }) => rest),
      courses: dbContext.courses?.map(({ id, ...rest }) => rest),
      schedules: dbContext.schedules,
    };

    const systemInstruction = `You are a scheduling assistant for a language school. Only answer questions about schedules, courses, teachers, time, days, periods, rooms, and conflicts. Some questions like rhetorical like what did the user say or recalling of their previous questions can be part of your response. If the question is out of scope, politely refuse.

When the user asks you to CREATE or GENERATE a schedule, you must respond with a special format:
1. First, provide your text response explaining the schedule
2. Then, on a new line, add: SCHEDULE_CREATE_COMMAND
3. Then, on the next line, add a JSON object with course NAME and teacher full NAME (the frontend will resolve these to IDs):
{
  "days": "M,W,F",
  "time_start": "09:00",
  "time_end": "11:00",
  "location": "Room 101",
  "notes": "Your optimization notes here",
  "courseName": "Course Name",
  "teacherFullName": "FirstName LastName",
  "periodBatchName": "Batch Name"
}

IMPORTANT: Use day codes: M, T, W, TH, F, S, SU (not Mon, Tue, etc.)

Example response when creating a schedule:
"I recommend this optimized schedule for the English course with minimal conflicts.

SCHEDULE_CREATE_COMMAND
{"days":"M,W,F","time_start":"09:00","time_end":"11:00","location":"Room 101","notes":"Optimized to avoid teacher conflicts","courseName":"English A1","teacherFullName":"John Doe","periodBatchName":"Batch 2025-1"}"

${SCHEMA_CONTEXT}

Current Database Data:
${JSON.stringify(aiContext, null, 2)}`;

    const contextualNotes = context
      ? `\n\nAdditional Context: ${JSON.stringify(context).slice(0, 4000)}`
      : '';

    // Build conversation history
    const contents = [];

    // Add system instruction as first user message
    contents.push({
      role: 'user',
      parts: [{ text: systemInstruction + contextualNotes }],
    });
    contents.push({
      role: 'model',
      parts: [
        { text: "Understood. I'm ready to help with scheduling questions." },
      ],
    });

    // Add chat history if provided
    if (Array.isArray(history) && history.length > 0) {
      history.forEach((msg) => {
        if (msg.role === 'user' || msg.role === 'model') {
          contents.push({
            role: msg.role,
            parts: [{ text: msg.content || msg.text || '' }],
          });
        }
      });
    }

    // Add current prompt
    contents.push({
      role: 'user',
      parts: [{ text: prompt }],
    });

    const model = geminiModel;
    const result = await model.generateContent({ contents });
    const text = result?.response?.text?.() || '';

    // Check if AI wants to create a schedule
    const scheduleCommandMatch = text.match(
      /SCHEDULE_CREATE_COMMAND[\s\n]*(\{[\s\S]*?\})/
    );

    if (scheduleCommandMatch) {
      try {
        const scheduleData = JSON.parse(scheduleCommandMatch[1]);
        const responseText = text
          .replace(/SCHEDULE_CREATE_COMMAND\s*\{[\s\S]*?\}/, '')
          .trim();

        // Resolve course ID
        let courseId = '';
        let courseName = scheduleData.courseName || '';
        if (courseName) {
          const course = dbContext.courses?.find(
            (c) => c.name.toLowerCase() === courseName.toLowerCase()
          );
          courseId = course?.id || '';
        }

        // Resolve teacher ID
        let teacherId = '';
        let teacherName = scheduleData.teacherFullName || '';
        if (teacherName) {
          const nameParts = teacherName.split(' ');
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';

          const teacher = await prisma.users.findFirst({
            where: {
              role: 'teacher',
              deletedAt: null,
              OR: [
                {
                  AND: [
                    { firstName: { contains: firstName } },
                    { lastName: { contains: lastName } },
                  ],
                },
                { firstName: { contains: teacherName } },
                { lastName: { contains: teacherName } },
              ],
            },
            select: { id: true, firstName: true, lastName: true },
          });
          if (teacher) {
            teacherId = teacher.id;
            teacherName = `${teacher.firstName} ${teacher.lastName}`;
          }
        }

        // Resolve academic period ID
        let academicPeriodId = '';
        let academicPeriodName = '';
        let periodStart = '';
        let periodEnd = '';

        if (scheduleData.periodBatchName) {
          const period = dbContext.academicPeriods?.find(
            (p) =>
              p.batchName.toLowerCase() === scheduleData.periodBatchName.toLowerCase()
          );
          if (period) {
            academicPeriodId = period.id;
            academicPeriodName = period.batchName;
            // Format dates to YYYY-MM-DD
            periodStart = new Date(period.startAt).toISOString().split('T')[0];
            periodEnd = new Date(period.endAt).toISOString().split('T')[0];
          }
        }

        return res.json({
          text: responseText,
          action: 'create_schedule',
          scheduleData: {
            courseId,
            courseName,
            academicPeriodId,
            academicPeriodName,
            teacherId,
            teacherName,
            days: scheduleData.days || '',
            time_start: scheduleData.time_start || '',
            time_end: scheduleData.time_end || '',
            location: scheduleData.location || '',
            notes: scheduleData.notes || '',
            periodStart,
            periodEnd,
            color: '#FFCF00',
          },
        });
      } catch (parseError) {
        console.error('Failed to parse schedule command:', parseError);
      }
    }

    return res.json({ text });
  } catch (err) {
    console.error('askGemini error:', err);
    return res.status(500).json({
      error: true,
      message: 'Failed to contact Gemini',
      details: err.message,
    });
  }
};
