import { GoogleGenerativeAI } from "@google/generative-ai";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SCHEMA_CONTEXT = `
Database Schema:
- schedule: id, days, time, time_start, time_end, location, notes, color, periodStart, periodEnd, courseId, periodId, teacherId
- course: id, name, description, maxNumber, visibility, price
- users: id, userId, firstName, lastName, email, role (student/teacher/admin)
- academic_period: id, batchName, startAt, endAt, enrollmentOpenAt, enrollmentCloseAt, isEnrollmentClosed
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
    const now = new Date();
    const activePeriods = await prisma.academic_period.findMany({
      where: {
        deletedAt: null,
        OR: [
          { startAt: { gte: now } }, // upcoming periods
          { endAt: { gte: now } }, // ongoing periods (not ended yet)
        ],
      },
      select: {
        id: true,
        batchName: true,
        startAt: true,
        endAt: true,
        enrollmentOpenAt: true,
        enrollmentCloseAt: true,
      },
      take: 5,
    });
    context.academicPeriods = activePeriods;

    // Get visible courses (with IDs for resolution)
    const courses = await prisma.course.findMany({
      where: {
        deletedAt: null,
        visibility: "visible",
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
          select: { batchName: true, startAt: true, endAt: true },
        },
      },
      take: 30,
    });
    context.schedules = schedules;

    return context;
  } catch (error) {
    console.error("Error fetching scheduling context:", error);
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
  model: "gemini-2.0-flash-exp",
  generationConfig: geminiConfig,
});

export const askGemini = async (req, res) => {
  try {
    const apiKey = (process.env.GEMINI_API_KEY || "").trim();
    if (!apiKey) {
      return res
        .status(500)
        .json({ error: true, message: "GEMINI_API_KEY is missing" });
    }

    const { prompt, context, history } = req.body || {};
    if (!prompt || typeof prompt !== "string") {
      return res
        .status(400)
        .json({ error: true, message: "prompt is required" });
    }

    // Fetch database context
    const dbContext = await getSchedulingContext();

    // Prepare data for AI (remove IDs)
    const aiContext = {
      academicPeriods: dbContext.academicPeriods?.map(
        ({ id, ...rest }) => rest
      ),
      courses: dbContext.courses?.map(({ id, ...rest }) => rest),
      schedules: dbContext.schedules,
    };

    const systemInstruction = `You are a friendly and polite scheduling assistant for a language school.

You can:
- Respond to greetings warmly (hi, hello, good day, etc.)
- Answer questions about schedules, courses, teachers, time, days, periods, rooms, and conflicts
- Help create and optimize schedules
- Recall previous conversation context

Be polite, professional, and helpful. For greetings, respond warmly and offer your assistance. For questions outside scheduling topics, politely redirect the user to scheduling-related queries.

When the user asks you to CREATE or GENERATE a schedule, you must respond with a special format:
1. First, provide your text response explaining the schedule, again explain that you might commit mistakes, thus encourage the user to recheck the information.
2. Then, on a new line, add: SCHEDULE_CREATE_COMMAND
3. Then, on the next line, add a JSON object with course NAME and teacher full NAME (the frontend will resolve these to IDs):
{
  "days": "M,W,F",
  "time_start": "09:00",
  "time_end": "11:00",
  "location": "Room 101",
  "notes": "Your optimization notes here, and also add on the end that this is AI Generated",
  "courseName": "Course Name",
  "teacherFullName": "FirstName LastName",
  "periodBatchName": "Batch Name",
  "requestedPeriodStart": "2025-10-15",
  "requestedPeriodEnd": "2025-11-15"
}

IMPORTANT:
- Use day codes: M, T, W, TH, F, S, SU (not Mon, Tue, etc.)
- Use 24-hour time format for time_start and time_end (e.g., "14:00" for 2 PM)
- If the user specifies custom start/end dates different from the academic period dates, include them in requestedPeriodStart and requestedPeriodEnd in YYYY-MM-DD format
- periodBatchName should match one of the academic periods from the database exactly

Example response when creating a schedule:
"I recommend this optimized schedule for the {coursename} course with minimal conflicts. Please double check for any mistakes."
"Here is the recommended schedule based on your request."

SCHEDULE_CREATE_COMMAND
{"days":"M,W,F","time_start":"09:00","time_end":"11:00","location":"Room 101","notes":"Optimized to avoid teacher conflicts, AI Generated","courseName":"English A1","teacherFullName":"John Doe","periodBatchName":"Batch 2025-1","requestedPeriodStart":"2025-10-15","requestedPeriodEnd":"2025-11-15"}"

${SCHEMA_CONTEXT}

Current Database Data:
${JSON.stringify(aiContext, null, 2)}`;

    const contextualNotes = context
      ? `\n\nAdditional Context: ${JSON.stringify(context).slice(0, 4000)}`
      : "";

    // Build conversation history
    const contents = [];

    // Add system instruction as first user message
    contents.push({
      role: "user",
      parts: [{ text: systemInstruction + contextualNotes }],
    });
    contents.push({
      role: "model",
      parts: [
        { text: "Understood. I'm ready to help with scheduling questions." },
      ],
    });

    // Add chat history if provided
    if (Array.isArray(history) && history.length > 0) {
      history.forEach((msg) => {
        if (msg.role === "user" || msg.role === "model") {
          contents.push({
            role: msg.role,
            parts: [{ text: msg.content || msg.text || "" }],
          });
        }
      });
    }

    // Add current prompt
    contents.push({
      role: "user",
      parts: [{ text: prompt }],
    });

    const model = geminiModel;
    const result = await model.generateContent({ contents });
    const text = result?.response?.text?.() || "";

    // Check if AI wants to create a schedule
    const scheduleCommandMatch = text.match(
      /SCHEDULE_CREATE_COMMAND[\s\n]*(\{[\s\S]*?\})/
    );

    if (scheduleCommandMatch) {
      try {
        const scheduleData = JSON.parse(scheduleCommandMatch[1]);
        const responseText = text
          .replace(/SCHEDULE_CREATE_COMMAND\s*\{[\s\S]*?\}/, "")
          .trim();

        // Resolve course ID
        let courseId = "";
        let courseName = scheduleData.courseName || "";
        if (courseName) {
          // Try exact match first
          let course = dbContext.courses?.find(
            (c) => c.name.toLowerCase() === courseName.toLowerCase()
          );

          // If no exact match, try fuzzy match (contains)
          if (!course) {
            course = dbContext.courses?.find(
              (c) =>
                c.name.toLowerCase().includes(courseName.toLowerCase()) ||
                courseName.toLowerCase().includes(c.name.toLowerCase())
            );
          }

          if (course) {
            courseId = course.id;
            courseName = course.name; // Use actual course name from DB
          }
        }

        // Resolve teacher ID
        let teacherId = "";
        let teacherName = scheduleData.teacherFullName || "";
        if (teacherName) {
          const nameParts = teacherName.split(" ");
          const firstName = nameParts[0] || "";
          const lastName = nameParts.slice(1).join(" ") || "";

          const teacher = await prisma.users.findFirst({
            where: {
              role: "teacher",
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
        let academicPeriodId = "";
        let academicPeriodName = "";
        let periodStart = "";
        let periodEnd = "";

        if (scheduleData.periodBatchName) {
          const period = dbContext.academicPeriods?.find(
            (p) =>
              p.batchName.toLowerCase() ===
              scheduleData.periodBatchName.toLowerCase()
          );
          if (period) {
            academicPeriodId = period.id;
            academicPeriodName = period.batchName;

            // Use requested dates if provided by AI, otherwise use full period dates
            if (
              scheduleData.requestedPeriodStart &&
              scheduleData.requestedPeriodEnd
            ) {
              periodStart = scheduleData.requestedPeriodStart;
              periodEnd = scheduleData.requestedPeriodEnd;
            } else {
              // Format dates to YYYY-MM-DD
              periodStart = new Date(period.startAt)
                .toISOString()
                .split("T")[0];
              periodEnd = new Date(period.endAt).toISOString().split("T")[0];
            }
          }
        }

        return res.json({
          text: responseText,
          action: "create_schedule",
          scheduleData: {
            courseId,
            courseName,
            academicPeriodId,
            academicPeriodName,
            teacherId,
            teacherName,
            days: scheduleData.days || "",
            time_start: scheduleData.time_start || "",
            time_end: scheduleData.time_end || "",
            location: scheduleData.location || "",
            notes: scheduleData.notes || "",
            periodStart,
            periodEnd,
            color: "#FFCF00",
          },
        });
      } catch (parseError) {
        console.error("Failed to parse schedule command:", parseError);
      }
    }

    return res.json({ text });
  } catch (err) {
    console.error("askGemini error:", err);
    return res.status(500).json({
      error: true,
      message: "Failed to contact Gemini",
      details: err.message,
    });
  }
};
