import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import { uploadFile } from "../utils/fileStorage.js";
import { filePaths } from "../constants/file_paths.js";
import upload from "../middleware/multerMiddleware.js";

const prisma = new PrismaClient();

// Helper function to check if an academic period is locked for grade changes
const isAcademicPeriodLocked = async (periodId) => {
  if (!periodId) return false; // If no period is associated, allow changes

  const period = await prisma.academic_period.findUnique({
    where: { id: periodId },
    select: { endAt: true, batchName: true },
  });

  if (!period) return false; // If period not found, allow changes

  // Check if the period's end date has passed
  const now = new Date();
  const isLocked = new Date(period.endAt) < now;

  return { isLocked, periodName: period.batchName };
};

// List all students and their grades for a course
export const getGradesByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const grades = await prisma.student_grade.findMany({
      where: { courseId },
      include: {
        student: true,
        files: true,
      },
    });
    res.json(grades);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch grades." });
  }
};

// Set or update a students grade
export const setOrUpdateGrade = async (req, res) => {
  try {
    console.log("Incoming grades payload:", req.body);
    const grades = Array.isArray(req.body) ? req.body : [req.body];

    // Check if any of the grades are for a locked academic period
    const periodIds = [...new Set(grades.map(g => g.periodId).filter(Boolean))];
    for (const periodId of periodIds) {
      const lockStatus = await isAcademicPeriodLocked(periodId);
      if (lockStatus.isLocked) {
        return res.status(403).json({
          error: "Cannot modify grades for a completed academic period.",
          reason: "PERIOD_LOCKED",
          periodName: lockStatus.periodName,
        });
      }
    }

    const results = [];
    for (const { studentId, courseId, periodId, grade, visibility } of grades) {
      let studentGrade = await prisma.student_grade.findFirst({
        where: { studentId, courseId, periodId },
      });

      const updateData = { grade };
      if (visibility === "visible" || visibility === "hidden") {
        updateData.visibility = visibility;
      }

      if (studentGrade) {
        studentGrade = await prisma.student_grade.update({
          where: { id: studentGrade.id },
          data: updateData,
        });
      } else {
        studentGrade = await prisma.student_grade.create({
          data: {
            studentId,
            courseId,
            periodId,
            grade,
            visibility: visibility || "hidden",
          },
        });
      }
      results.push(studentGrade);
    }
    res.json({ success: true, updated: results.length, grades: results });
  } catch (err) {
    console.error("Batch grade save error:", err);
    res.status(500).json({ error: "Failed to set/update grades." });
  }
};

// Upload a grade breakdown file
export const uploadGradeFile = async (req, res) => {
  try {
    let { studentGradeId } = req.params;
    let periodIdToCheck = null;

    // Handle case where studentGradeId is null or "null" (when student doesn't have a grade record yet)
    if (
      !studentGradeId ||
      studentGradeId === "null" ||
      studentGradeId === "undefined"
    ) {
      // Extract studentId, courseId, and periodId from request body (sent as form data)
      const { studentId, courseId, periodId } = req.body;

      if (!studentId || !courseId) {
        return res.status(400).json({
          error:
            "Missing required fields. When studentGradeId is null, studentId and courseId must be provided.",
        });
      }

      periodIdToCheck = periodId || null;

      // Find or create a grade record for this student/course/period
      let studentGrade = await prisma.student_grade.findFirst({
        where: {
          studentId,
          courseId,
          ...(periodId && { periodId }),
        },
      });

      if (!studentGrade) {
        // Create a new grade record with default 'NoGrade' status
        studentGrade = await prisma.student_grade.create({
          data: {
            studentId,
            courseId,
            periodId: periodId || null,
            grade: "NoGrade",
          },
        });
      }

      studentGradeId = studentGrade.id;
    } else {
      // Fetch the existing grade record to get the periodId
      const existingGrade = await prisma.student_grade.findUnique({
        where: { id: studentGradeId },
        select: { periodId: true },
      });
      periodIdToCheck = existingGrade?.periodId || null;
    }

    // Check if the academic period is locked
    if (periodIdToCheck) {
      const lockStatus = await isAcademicPeriodLocked(periodIdToCheck);
      if (lockStatus.isLocked) {
        return res.status(403).json({
          error: "Cannot upload files for grades in a completed academic period.",
          reason: "PERIOD_LOCKED",
          periodName: lockStatus.periodName,
        });
      }
    }

    if (!req.file) return res.status(400).json({ error: "No file uploaded." });

    // Upload file to Firebase Storage
    const uploadResult = await uploadFile(req.file, filePaths.grades);
    if (!uploadResult.success) {
      return res
        .status(500)
        .json({ error: "Failed to upload file to storage." });
    }

    const file = await prisma.grade_file.create({
      data: {
        studentGradeId,
        url: uploadResult.downloadURL,
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
        uploadedBy: req.user.id,
      },
    });
    res.json(file);
  } catch (err) {
    console.error("Grade file upload error:", err);
    res.status(500).json({ error: "Failed to upload file." });
  }
};

// List/download files for a grade
export const getGradeFiles = async (req, res) => {
  try {
    const { studentGradeId } = req.params;
    const files = await prisma.grade_file.findMany({
      where: { studentGradeId },
    });
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch files." });
  }
};

// Approve a grade
export const approveGrade = async (req, res) => {
  try {
    const { studentGradeId } = req.params;

    // Fetch the grade record to get the periodId
    const gradeRecord = await prisma.student_grade.findUnique({
      where: { id: studentGradeId },
      select: { periodId: true },
    });

    if (!gradeRecord) {
      return res.status(404).json({ error: "Grade record not found." });
    }

    // Check if the academic period is locked
    if (gradeRecord.periodId) {
      const lockStatus = await isAcademicPeriodLocked(gradeRecord.periodId);
      if (lockStatus.isLocked) {
        return res.status(403).json({
          error: "Cannot approve grades for a completed academic period.",
          reason: "PERIOD_LOCKED",
          periodName: lockStatus.periodName,
        });
      }
    }

    const approvedGrade = await prisma.student_grade.update({
      where: { id: studentGradeId },
      data: {
        approvedBy: req.user.id,
        approvedAt: new Date(),
      },
    });
    res.json(approvedGrade);
  } catch (err) {
    res.status(500).json({ error: "Failed to approve grade." });
  }
};

// List all students in a schedule for grading
export const getStudentsBySchedule = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    // Find all user_schedule entries for this schedule
    const userSchedules = await prisma.user_schedule.findMany({
      where: { 
        scheduleId: Number(scheduleId),
        deletedAt: null,
      },
      include: {
        user: true,
      },
    });
    const schedule = await prisma.schedule.findUnique({
      where: { id: Number(scheduleId) },
      select: { courseId: true, teacherId: true, periodId: true },
    });

    // For each student, fetch their grade for this course/period and check for file existence
    const studentsWithGrades = await Promise.all(
      userSchedules.map(async (us) => {
        let gradeRecord = null;
        let hasDoc = false;
        let studentGradeId = null;
        let visibility = "hidden";
        if (schedule && us.userId && schedule.courseId) {
          gradeRecord = await prisma.student_grade.findFirst({
            where: {
              studentId: us.userId,
              courseId: schedule.courseId,
            },
            select: { id: true, grade: true, visibility: true },
          });
          if (gradeRecord && gradeRecord.id) {
            studentGradeId = gradeRecord.id;
            visibility = gradeRecord.visibility;
            // Check if any files exist for this studentGradeId
            const fileCount = await prisma.grade_file.count({
              where: { studentGradeId: gradeRecord.id },
            });
            hasDoc = fileCount > 0;
          }
        }
        return {
          ...us,
          grade: gradeRecord ? gradeRecord.grade : null,
          studentGradeId,
          visibility,
          hasDoc,
        };
      })
    );

    res.json({ schedule, students: studentsWithGrades });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch students for schedule." });
  }
};

//Get all grades for a student
export const getGradesByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    let grades = await prisma.student_grade.findMany({
      where: { studentId },
      include: {
        course: true,
        files: true,
      },
      orderBy: { createdAt: "desc" },
    });
    // For each grade, keep only the latest file (by uploadedAt)
    // If visibility is 'hidden', show grade as 'NoGrade' and no files
    grades = grades.map((g) => {
      const isVisible = g.visibility === "visible";

      let latestFile = null;
      if (isVisible && g.files && g.files.length > 0) {
        latestFile = [...g.files].sort(
          (a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)
        )[0];
      }

      return {
        ...g,
        grade: isVisible ? g.grade : "NoGrade",
        files: isVisible && latestFile ? [latestFile] : [],
      };
    });
    res.json(grades);
  } catch (err) {
    console.error("Error fetching grades:", err);
    res.status(500).json({ error: "Failed to fetch grades." });
  }
};

export const updateGradesVisibility = async (req, res) => {
  try {
    const { courseId, periodId, visibility } = req.body;

    if (!courseId || (visibility !== "visible" && visibility !== "hidden")) {
      return res.status(400).json({
        error: "courseId and visibility (visible or hidden) are required.",
      });
    }

    // Check if the academic period is locked
    if (periodId) {
      const lockStatus = await isAcademicPeriodLocked(periodId);
      if (lockStatus.isLocked) {
        return res.status(403).json({
          error: "Cannot change grade visibility for a completed academic period.",
          reason: "PERIOD_LOCKED",
          periodName: lockStatus.periodName,
        });
      }
    }

    const result = await prisma.student_grade.updateMany({
      where: {
        courseId,
        ...(periodId && { periodId }),
      },
      data: {
        visibility,
      },
    });

    res.json({
      success: true,
      updated: result.count,
      visibility,
    });
  } catch (err) {
    console.error("Update visibility error:", err);
    res.status(500).json({ error: "Failed to update grades visibility." });
  }
};

export default {
  getGradesByCourse,
  setOrUpdateGrade,
  uploadGradeFile,
  getGradeFiles,
  approveGrade,
  getStudentsBySchedule,
  getGradesByStudent,
  updateGradesVisibility,
};
