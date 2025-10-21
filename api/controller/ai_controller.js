import { GoogleGenerativeAI } from "@google/generative-ai";
import { PrismaClient } from "@prisma/client";
import {
  logError,
  logUserActivity,
  logSystemActivity,
} from "../utils/logger.js";
import { ModuleTypes } from "../constants/module_types.js";

const prisma = new PrismaClient();

const SCHEMA_CONTEXT = `
Database Schema:
- schedule: id, days, time, time_start, time_end, location, notes, color, periodStart, periodEnd, courseId, periodId, teacherId, capacity
- course: id, name, description, maxNumber, visibility, price
- users: id, userId, firstName, lastName, email, role (student/teacher/admin)
- academic_period: id, batchName, startAt, endAt, enrollmentOpenAt, enrollmentCloseAt, isEnrollmentClosed
- user_schedule: links students to their schedules
- student_enrollment: studentId, periodId, status (enrolled/completed/dropped/withdrawn)

Relationships:
- Schedule belongs to course, academic_period, and teacher (users)
- Students enroll in academic periods and have schedules through user_schedule
- Schedule capacity limits the number of students that can enroll (default: 30)
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
        capacity: true,
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
    await logSystemActivity(
      "AI: Scheduling Context Fetched",
      ModuleTypes.SCHEDULES,
      JSON.stringify(schedules)
    );
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

// Get safe database context with aggregated data
async function getSafeReportContext() {
  try {
    const context = {};

    // Get academic periods (no sensitive data)
    const academicPeriods = await prisma.academic_period.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        batchName: true,
        startAt: true,
        endAt: true,
        enrollmentOpenAt: true,
        enrollmentCloseAt: true,
        isEnrollmentClosed: true,
      },
      take: 50,
    });
    context.academicPeriods = academicPeriods;

    // Get courses (no sensitive data)
    const courses = await prisma.course.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        name: true,
        description: true,
        maxNumber: true,
        visibility: true,
        price: true,
      },
      take: 100,
    });
    context.courses = courses;

    // Get schedules with related data (excluding sensitive info)
    const schedules = await prisma.schedule.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        days: true,
        time_start: true,
        time_end: true,
        location: true,
        capacity: true,
        periodStart: true,
        periodEnd: true,
        course: {
          select: { id: true, name: true },
        },
        teacher: {
          select: { id: true, userId: true, firstName: true, lastName: true },
        },
        period: {
          select: { id: true, batchName: true },
        },
        userSchedules: {
          where: { deletedAt: null },
          select: {
            id: true,
            user: {
              select: {
                userId: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      take: 100,
    });
    context.schedules = schedules.map((s) => ({
      ...s,
      enrollmentCount: s.userSchedules.length,
      userSchedules: undefined, // Remove detailed user schedules, just keep count
    }));

    // Get enrollment statistics (excluding sensitive user data)
    const enrollmentStats = await prisma.student_enrollment.groupBy({
      by: ["periodId", "status"],
      where: { deletedAt: null },
      _count: { id: true },
    });
    context.enrollmentStats = enrollmentStats;

    // Get user counts by role and status (no personal data)
    const userStats = await prisma.users.groupBy({
      by: ["role", "status"],
      where: { deletedAt: null },
      _count: { id: true },
    });
    context.userStats = userStats;

    await logSystemActivity(
      "AI: Safe Report Context Fetched",
      ModuleTypes.REPORTS,
      JSON.stringify(context)
    );
    return context;
  } catch (error) {
    console.error("Error fetching safe report context:", error);
    return {};
  }
}

// AI Report Generation endpoint
export const generateAIReport = async (req, res) => {
  try {
    const apiKey = (process.env.GEMINI_API_KEY || "").trim();
    if (!apiKey) {
      await logError(
        "AI: Generate Report Error - Missing API Key",
        new Error("GEMINI_API_KEY is missing"),
        req.user?.data?.userId || null,
        ModuleTypes.REPORTS
      );
      return res
        .status(500)
        .json({ error: true, message: "GEMINI_API_KEY is missing" });
    }

    const { prompt, history } = req.body || {};
    if (!prompt || typeof prompt !== "string") {
      await logError(
        "AI: Generate Report Error - Invalid Prompt",
        new Error("prompt is required"),
        req.user?.data?.userId || null,
        ModuleTypes.REPORTS
      );
      return res
        .status(400)
        .json({ error: true, message: "prompt is required" });
    }

    // Fetch safe database context
    const dbContext = await getSafeReportContext();

    const systemInstruction = `You are an AI assistant that helps analyze educational data and generate custom reports.

Available Data:
- Academic Periods: Information about enrollment periods and batches
- Courses: Available courses with pricing and capacity
- Schedules: Class schedules with time, location, teacher, and enrollment counts
- Enrollment Statistics: Enrollment counts by period and status
- User Statistics: User counts by role (student, teacher, admin) and status

IMPORTANT SECURITY RULES:
- You have access to aggregated and non-sensitive data only
- Email addresses and passwords are NEVER accessible
- You can analyze trends, create summaries, and answer questions about the data
- You can perform calculations and generate insights

Current Database Context:
${JSON.stringify(dbContext, null, 2)}

When the user asks for a report or analysis, analyze the provided data and present insights in a clear, well-formatted way. You can:
- Count students, courses, enrollments
- Calculate averages, percentages, trends
- Compare data across periods
- Identify patterns
- Generate summaries

SPECIAL ACTION - GENERATE REPORT TABLE:
When the user asks you to create, generate, or build a report table, you must respond with a special format:
1. First, provide your text response explaining the report and what it contains
2. Then, on a new line, add: GENERATE_REPORT_TABLE
3. Then, on the next line, add a JSON object with the report structure:
{
  "reportName": "Name of the Report",
  "summary": {
    "key1": "value1",
    "key2": "value2"
  },
  "columns": [
    {"field": "fieldName1", "header": "Display Name 1", "type": "text"},
    {"field": "fieldName2", "header": "Display Name 2", "type": "number"}
  ],
  "data": [
    {"fieldName1": "value1", "fieldName2": 123},
    {"fieldName1": "value2", "fieldName2": 456}
  ]
}

Column types can be: "text", "number", "date", "percentage", "currency"

Example response when creating a report table:
"Here is a Course Enrollment Statistics report based on the current data. This shows enrollment metrics for each course section."

GENERATE_REPORT_TABLE
{"reportName":"Course Enrollment Statistics","summary":{"totalSections":5,"totalEnrolledStudents":120,"averageEnrollmentPerSection":"24.00"},"columns":[{"field":"courseName","header":"Course Name","type":"text"},{"field":"enrolledStudents","header":"Enrolled Students","type":"number"},{"field":"capacity","header":"Capacity","type":"number"},{"field":"occupancyRate","header":"Occupancy Rate","type":"percentage"}],"data":[{"courseName":"English A1","enrolledStudents":25,"capacity":30,"occupancyRate":"83.33%"},{"courseName":"Spanish B1","enrolledStudents":20,"capacity":30,"occupancyRate":"66.67%"}]}

If the user asks for data you don't have access to, politely explain the limitation and suggest what you can provide instead.
`;

    // Build conversation history
    const contents = [];

    contents.push({
      role: "user",
      parts: [{ text: systemInstruction }],
    });
    contents.push({
      role: "model",
      parts: [
        {
          text: "Understood. I will analyze the educational data and generate insights while respecting data privacy and security constraints.",
        },
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
    const responseText = result?.response?.text?.() || "";

    // Check if AI wants to generate a report table
    const reportTableMatch = responseText.match(
      /GENERATE_REPORT_TABLE[\s\n]*(\{[\s\S]*?\})(?=\n|$)/
    );

    if (reportTableMatch) {
      try {
        const reportData = JSON.parse(reportTableMatch[1]);
        const cleanText = responseText
          .replace(/GENERATE_REPORT_TABLE\s*\{[\s\S]*?\}/, "")
          .trim();

        return res.json({
          text: cleanText,
          action: "generate_report_table",
          reportData: {
            reportName: reportData.reportName || "Custom Report",
            summary: reportData.summary || {},
            columns: reportData.columns || [],
            data: reportData.data || [],
            generatedAt: new Date(),
          },
          dataContext: {
            academicPeriodsCount: dbContext.academicPeriods?.length || 0,
            coursesCount: dbContext.courses?.length || 0,
            schedulesCount: dbContext.schedules?.length || 0,
          },
        });
      } catch (parseError) {
        console.error("Failed to parse report table command:", parseError);
        // Fall through to normal response if parsing fails
      }
    }

    return res.json({
      text: responseText,
      dataContext: {
        academicPeriodsCount: dbContext.academicPeriods?.length || 0,
        coursesCount: dbContext.courses?.length || 0,
        schedulesCount: dbContext.schedules?.length || 0,
      },
    });
  } catch (err) {
    console.error("generateAIReport error:", err);
    return res.status(500).json({
      error: true,
      message: "Failed to generate AI report",
      details: err.message,
    });
  }
};

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
  "requestedPeriodEnd": "2025-11-15",
  "capacity": 30
}

IMPORTANT:
- Use day codes: M, T, W, TH, F, S, SU (not Mon, Tue, etc.)
- Use 24-hour time format for time_start and time_end (e.g., "14:00" for 2 PM)
- If the user specifies custom start/end dates different from the academic period dates, include them in requestedPeriodStart and requestedPeriodEnd in YYYY-MM-DD format
- periodBatchName should match one of the academic periods from the database exactly
- capacity should be a number between 1 and 100 (default: 30). If the user specifies a capacity, use it. Otherwise, use 30 or a reasonable default based on the course's maxNumber if available.

Example response when creating a schedule:
"I recommend this optimized schedule for the {coursename} course with minimal conflicts. Please double check for any mistakes."
"Here is the recommended schedule based on your request."

SCHEDULE_CREATE_COMMAND
{"days":"M,W,F","time_start":"09:00","time_end":"11:00","location":"Room 101","notes":"Optimized to avoid teacher conflicts, AI Generated","courseName":"English A1","teacherFullName":"John Doe","periodBatchName":"Batch 2025-1","requestedPeriodStart":"2025-10-15","requestedPeriodEnd":"2025-11-15","capacity":30}"

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

        const userId = req.user?.data?.userId || null;
        console.log("Creating log with userId:", userId);

        const logResult = await logUserActivity(
          "AI: Ask Gemini (Schedule)",
          userId,
          ModuleTypes.SCHEDULES,
          JSON.stringify({
            prompt,
            context,
            history,
            scheduleData,
          })
        );

        if (!logResult.success) {
          console.error("Failed to create log:", logResult.error);
        } else {
          console.log("Log created successfully:", logResult.log?.id);
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
            capacity: scheduleData.capacity || 30,
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
