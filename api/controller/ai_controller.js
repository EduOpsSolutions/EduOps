import { GoogleGenerativeAI } from "@google/generative-ai";
import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import {
  logError,
  logUserActivity,
  logSystemActivity,
} from "../utils/logger.js";
import { MODULE_TYPES } from "../constants/module_types.js";
import { getDbData, getAvailableTemplates } from "../utils/dbQueryTemplates.js";

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
      MODULE_TYPES.SCHEDULES,
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
      MODULE_TYPES.REPORTS,
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
        MODULE_TYPES.REPORTS
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
        MODULE_TYPES.REPORTS
      );
      return res
        .status(400)
        .json({ error: true, message: "prompt is required" });
    }

    // Fetch safe database context
    const dbContext = await getSafeReportContext();

    // Get available query templates
    const availableTemplates = getAvailableTemplates();

    const systemInstruction = `You are an AI assistant that helps analyze educational data and generate custom reports.

Available Data Sources:
- Academic Periods: Information about enrollment periods and batches
- Courses: Available courses with pricing and capacity
- Schedules: Class schedules with time, location, teacher, and enrollment counts
- Enrollment Statistics: Enrollment counts by period and status
- User Statistics: User counts by role (student, teacher, admin) and status
- Payments: Payment records and transaction history
- Fees: Course fees and fee structures
- Document Requests: Student document request statuses

IMPORTANT SECURITY RULES:
- You have access to aggregated and non-sensitive data only
- Email addresses and passwords are NEVER accessible
- You can analyze trends, create summaries, and answer questions about the data
- You can perform calculations and generate insights

DATABASE QUERY CAPABILITIES:
You have TWO ways to access data:

1. **EXISTING REPORT ENDPOINTS** (Preferred for standard reports):
   Use these for common reports that are already implemented:
   - student-enrollment: Student enrollment list with courses and status
   - financial-assessment: Assessment fees, payments, and balances
   - grade-distribution: Pass/fail statistics by course
   - course-enrollment-stats: Enrollment counts and capacity by course
   - transaction-history: Payment transaction records
   - faculty-teaching-load: Teaching schedules by faculty
   - enrollment-period-analysis: Enrollment period statistics
   - outstanding-balance: Students with unpaid balances
   - document-submission-status: Document request statuses
   - class-schedule: Complete class schedules
   - student-ledger-summary: Individual student financial ledger
   - enrollment-requests-log: Enrollment request history
   - fee-structure: Fee breakdown by course
   - user-account-activity: System activity logs

   To use existing reports, include them in your GENERATE_REPORT_TABLE response.

2. **CUSTOM DATABASE QUERIES** (For specific data needs):
   Use this when you need specific data not available in existing reports:

   DB_QUERY_REQUEST
   {
     "templateName": "templateName",
     "parameters": { "param1": "value1" }
   }

   Available Query Templates:
   ${JSON.stringify(availableTemplates, null, 2)}

DECISION GUIDE:
- If user asks for a standard report (enrollments, financials, schedules): Suggest using existing report endpoint
- If user needs specific filtered data or aggregations: Use DB_QUERY_REQUEST
- If user wants a custom analysis: Use DB_QUERY_REQUEST, then GENERATE_REPORT_TABLE

ASKING CLARIFYING QUESTIONS:
When you need more information to provide an accurate response, ASK THE USER clarifying questions instead of making assumptions:

Examples of when to ask questions:
- User asks for "payment report" → Ask: "Which academic period? All payments or just paid ones? Any specific date range?"
- User asks for "student list" → Ask: "Which academic period? Only active students or all statuses?"
- User asks for "schedule report" → Ask: "Which academic period? Any specific courses or teachers?"
- User asks for data with unclear scope → Ask for clarification before querying

IMPORTANT GUIDELINES:
1. **Ask specific questions** - Include options when possible (e.g., "Would you like to see: A) Current period only, B) All periods, C) Specific period?")
2. **Explain why you're asking** - Help users understand what information you need
3. **Suggest defaults** - Offer reasonable default options (e.g., "I can show the current period by default")
4. **Don't assume** - If a parameter is ambiguous, ask instead of guessing
5. **Be concise** - Keep questions brief and focused

Example conversation flow:
User: "Show me payments"
AI: "I can generate a payment report for you. To make it most useful:
     - Which academic period? (I see 'Batch 046' is current)
     - Payment status? (All / Paid only / Pending only)
     - Any specific date range?

     Or I can show all paid payments for the current period - would that work?"

User: "Current period, paid only"
AI: [Uses DB_QUERY_REQUEST with those parameters]

IMPORTANT: When you need fresh or specific data not in the current context, use DB_QUERY_REQUEST. The system will execute the query and provide results in the next message. You can then use that data to answer the user's question or generate a report.

Current Database Context (Summary):
${JSON.stringify(dbContext, null, 2)}

When the user asks for a report or analysis, you can:
- Use the current context data for quick answers
- Request additional data using DB_QUERY_REQUEST when needed
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

    // Log for debugging
    console.log("=== AI Response ===");
    console.log("Contains DB_QUERY_REQUEST:", responseText.includes("DB_QUERY_REQUEST"));
    console.log("Contains GENERATE_REPORT_TABLE:", responseText.includes("GENERATE_REPORT_TABLE"));
    console.log("Response preview:", responseText.substring(0, 200));

    // Check if AI wants to query the database using simple string search
    if (responseText.includes("DB_QUERY_REQUEST")) {
      console.log("🔍 Detected DB_QUERY_REQUEST - parsing...");
      try {
        // Extract JSON between the first { and last } after DB_QUERY_REQUEST
        const startMarker = "DB_QUERY_REQUEST";
        const startIndex = responseText.indexOf(startMarker);
        const afterMarker = responseText.substring(startIndex + startMarker.length);

        // Find the first opening brace
        const jsonStart = afterMarker.indexOf("{");
        if (jsonStart === -1) {
          console.log("❌ No JSON found after DB_QUERY_REQUEST");
          console.log("After marker:", afterMarker.substring(0, 100));
          throw new Error("No JSON found after DB_QUERY_REQUEST");
        }

        // Find the matching closing brace
        let braceCount = 0;
        let jsonEnd = -1;
        for (let i = jsonStart; i < afterMarker.length; i++) {
          if (afterMarker[i] === "{") braceCount++;
          if (afterMarker[i] === "}") {
            braceCount--;
            if (braceCount === 0) {
              jsonEnd = i;
              break;
            }
          }
        }

        if (jsonEnd === -1) throw new Error("No matching closing brace found");

        // Extract and parse the JSON
        const jsonString = afterMarker.substring(jsonStart, jsonEnd + 1);
        console.log("📝 Extracted JSON:", jsonString);

        const queryRequest = JSON.parse(jsonString);
        const { templateName, parameters } = queryRequest;

        console.log(`✅ Parsed request - Template: ${templateName}, Params:`, parameters);

        // Execute the database query
        console.log("🔄 Executing database query...");
        const queryResult = await getDbData(templateName, parameters);
        console.log(`✅ Query result - Success: ${queryResult.success}, Rows: ${queryResult.rowCount}`);

        if (queryResult.success) {
          // Extract the explanation text (everything before DB_QUERY_REQUEST)
          let explanationText = responseText
            .substring(0, startIndex)
            .trim();

          // Remove any trailing code block markers (```) from the explanation
          explanationText = explanationText.replace(/```\s*$/, "").trim();

          console.log("📄 Explanation text:", explanationText);

          // Return the query result so the AI can process it in the next turn
          const responseData = {
            text: explanationText || `Retrieving data using template: ${queryResult.template}`,
            action: "db_query_executed",
            queryResult: {
              template: queryResult.template,
              parameters: queryResult.parameters,
              rowCount: queryResult.rowCount,
              data: queryResult.data,
            },
            dataContext: {
              academicPeriodsCount: dbContext.academicPeriods?.length || 0,
              coursesCount: dbContext.courses?.length || 0,
              schedulesCount: dbContext.schedules?.length || 0,
            },
          };

          console.log("📤 Returning response with action:", responseData.action);
          console.log("📤 Response text preview:", responseData.text.substring(0, 100));

          return res.json(responseData);
        } else {
          // Query failed
          return res.json({
            text: `Failed to retrieve data: ${queryResult.error}`,
            action: "db_query_failed",
            error: queryResult.error,
          });
        }
      } catch (parseError) {
        console.error("❌ Failed to parse DB query request:", parseError);
        console.error("Error details:", parseError.message);
        // Fall through to normal processing
      }
    } else {
      console.log("ℹ️  No DB_QUERY_REQUEST detected in response");
    }

    // Check if AI wants to generate a report table using simple string search
    if (responseText.includes("GENERATE_REPORT_TABLE")) {
      try {
        // Extract JSON between the first { and last } after GENERATE_REPORT_TABLE
        const startMarker = "GENERATE_REPORT_TABLE";
        const startIndex = responseText.indexOf(startMarker);
        const afterMarker = responseText.substring(startIndex + startMarker.length);

        // Find the first opening brace
        const jsonStart = afterMarker.indexOf("{");
        if (jsonStart === -1) throw new Error("No JSON found after GENERATE_REPORT_TABLE");

        // Find the matching closing brace
        let braceCount = 0;
        let jsonEnd = -1;
        for (let i = jsonStart; i < afterMarker.length; i++) {
          if (afterMarker[i] === "{") braceCount++;
          if (afterMarker[i] === "}") {
            braceCount--;
            if (braceCount === 0) {
              jsonEnd = i;
              break;
            }
          }
        }

        if (jsonEnd === -1) throw new Error("No matching closing brace found");

        // Extract and parse the JSON
        const jsonString = afterMarker.substring(jsonStart, jsonEnd + 1);
        const reportData = JSON.parse(jsonString);

        // Extract the explanation text (everything before GENERATE_REPORT_TABLE)
        const cleanText = responseText
          .substring(0, startIndex)
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
              // Format dates to YYYY-MM-DD without timezone conversion
              const formatDate = (dateString) => {
                const date = new Date(dateString);
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, "0");
                const day = String(date.getDate()).padStart(2, "0");
                return `${year}-${month}-${day}`;
              };
              periodStart = formatDate(period.startAt);
              periodEnd = formatDate(period.endAt);
            }
          }
        }

        const userId = req.user?.data?.userId || null;
        console.log("Creating log with userId:", userId);

        const logResult = await logUserActivity(
          "AI: Ask Gemini (Schedule)",
          userId,
          MODULE_TYPES.SCHEDULES,
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
