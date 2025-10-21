import { PrismaClient } from '@prisma/client';
import { uploadFile } from '../utils/fileStorage.js';
import { filePaths } from '../constants/file_paths.js';
import upload from '../middleware/multerMiddleware.js';

const prisma = new PrismaClient();

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
    res.status(500).json({ error: 'Failed to fetch grades.' });
  }
};

// Set or update a students grade
export const setOrUpdateGrade = async (req, res) => {
  try {
    console.log('Incoming grades payload:', req.body);
    const grades = Array.isArray(req.body) ? req.body : [req.body];
    const results = [];
    for (const { studentId, courseId, periodId, grade } of grades) {
      let studentGrade = await prisma.student_grade.findFirst({
        where: { studentId, courseId, periodId },
      });
      if (studentGrade) {
        studentGrade = await prisma.student_grade.update({
          where: { id: studentGrade.id },
          data: { grade },
        });
      } else {
        studentGrade = await prisma.student_grade.create({
          data: { studentId, courseId, periodId, grade },
        });
      }
      results.push(studentGrade);
    }
    res.json({ success: true, updated: results.length, grades: results });
  } catch (err) {
    console.error('Batch grade save error:', err);
    res.status(500).json({ error: 'Failed to set/update grades.' });
  }
};

// Upload a grade breakdown file
export const uploadGradeFile = async (req, res) => {
  try {
    const { studentGradeId } = req.params;
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });

    // Upload file to Firebase Storage
    const uploadResult = await uploadFile(req.file, filePaths.grades);
    if (!uploadResult.success) {
      return res.status(500).json({ error: 'Failed to upload file to storage.' });
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
    console.error('Grade file upload error:', err);
    res.status(500).json({ error: 'Failed to upload file.' });
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
    res.status(500).json({ error: 'Failed to fetch files.' });
  }
};

// Approve a grade
export const approveGrade = async (req, res) => {
  try {
    const { studentGradeId } = req.params;
    const approvedGrade = await prisma.student_grade.update({
      where: { id: studentGradeId },
      data: {
        approvedBy: req.user.id,
        approvedAt: new Date(),
      },
    });
    res.json(approvedGrade);
  } catch (err) {
    res.status(500).json({ error: 'Failed to approve grade.' });
  }
};

// List all students in a schedule for grading
export const getStudentsBySchedule = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    // Find all user_schedule entries for this schedule
    const userSchedules = await prisma.user_schedule.findMany({
      where: { scheduleId: Number(scheduleId) },
      include: {
        user: true,
      },
    });
    const schedule = await prisma.schedule.findUnique({
      where: { id: Number(scheduleId) },
      select: { courseId: true, teacherId: true },
    });

    // For each student, fetch their grade for this course/period and check for file existence
    const studentsWithGrades = await Promise.all(userSchedules.map(async (us) => {
      let gradeRecord = null;
      let hasDoc = false;
      let studentGradeId = null;
      if (schedule && us.userId && schedule.courseId) {
        gradeRecord = await prisma.student_grade.findFirst({
          where: {
            studentId: us.userId,
            courseId: schedule.courseId,
          },
          select: { id: true, grade: true },
        });
        if (gradeRecord && gradeRecord.id) {
          studentGradeId = gradeRecord.id;
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
        hasDoc,
      };
    }));

    res.json({ schedule, students: studentsWithGrades });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch students for schedule.' });
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
      orderBy: { createdAt: 'desc' },
    });
    // For each grade, keep only the latest file (by uploadedAt)
    grades = grades.map(g => {
      let latestFile = null;
      if (g.files && g.files.length > 0) {
        latestFile = [...g.files].sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))[0];
      }
      return {
        ...g,
        files: latestFile ? [latestFile] : [],
      };
    });
    res.json(grades);
  } catch (err) {
    console.error('Error fetching grades:', err);
    res.status(500).json({ error: 'Failed to fetch grades.' });
  }
};

export default {
    getGradesByCourse,
    setOrUpdateGrade,
    uploadGradeFile,
    getGradeFiles,
    approveGrade,
    getStudentsBySchedule,
    getGradesByStudent
};
