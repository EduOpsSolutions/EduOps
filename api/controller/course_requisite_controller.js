import pkg from "@prisma/client";
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

// List all requisites for a course
export const listRequisites = async (req, res) => {
  const { courseId, courseIds } = req.query;
  try {
    let where = {};
    if (courseIds) {
      // Support comma-separated list
      const ids = courseIds
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);
      if (ids.length === 0) {
        return res.status(400).json({ error: "No valid courseIds provided." });
      }
      where.courseId = { in: ids };
    } else if (courseId) {
      where.courseId = courseId;
    } else {
      return res
        .status(400)
        .json({ error: "Missing courseId or courseIds query parameter." });
    }
    const requisites = await prisma.course_requisite.findMany({
      where,
      include: {
        requisiteCourse: true,
      },
    });
    res.json(requisites);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch requisites." });
  }
};

// Create a new requisite
export const createRequisite = async (req, res) => {
  const { courseId, requisiteCourseId, type, ruleName } = req.body;
  try {
    // Prevent self-requisite
    if (courseId === requisiteCourseId) {
      return res
        .status(400)
        .json({ error: "A course cannot be its own requisite." });
    }
    // Prevent duplicate
    const existing = await prisma.course_requisite.findFirst({
      where: {
        courseId,
        requisiteCourseId,
      },
    });
    if (existing) {
      return res
        .status(400)
        .json({ error: "This course-requisite pair already exists." });
    }
    const newRequisite = await prisma.course_requisite.create({
      data: {
        courseId,
        requisiteCourseId,
        type,
        ruleName,
      },
    });
    res.status(201).json(newRequisite);
  } catch (error) {
    res.status(500).json({ error: "Failed to create requisite." });
  }
};

// Update a requisite
export const updateRequisite = async (req, res) => {
  const { id } = req.params;
  const { requisiteCourseId, type, ruleName } = req.body;
  try {
    const updated = await prisma.course_requisite.update({
      where: { id },
      data: {
        requisiteCourseId,
        type,
        ruleName,
      },
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to update requisite." });
  }
};

// Delete a requisite
export const deleteRequisite = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.course_requisite.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete requisite." });
  }
};

// Check if a student has met the prerequisites/corequisites for courses
export const checkStudentRequisites = async (req, res) => {
  const { studentId, courseIds } = req.query;

  try {
    if (!studentId || !courseIds) {
      return res.status(400).json({
        error: "Missing studentId or courseIds query parameters.",
      });
    }

    const ids = courseIds
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);

    if (ids.length === 0) {
      return res.status(400).json({ error: "No valid courseIds provided." });
    }

    // Fetch all requisites for the requested courses
    const requisites = await prisma.course_requisite.findMany({
      where: {
        courseId: { in: ids },
        deletedAt: null,
      },
      include: {
        requisiteCourse: true,
      },
    });

    // Fetch all student grades with Pass status
    const passedCourses = await prisma.student_grade.findMany({
      where: {
        studentId: studentId,
        grade: "Pass",
      },
      select: {
        courseId: true,
      },
    });

    const passedCourseIds = new Set(passedCourses.map((g) => g.courseId));

    // Build result for each course
    const result = ids.map((courseId) => {
      const courseRequisites = requisites.filter((r) => r.courseId === courseId);

      if (courseRequisites.length === 0) {
        // No requisites = eligible
        return {
          courseId,
          eligible: true,
          missingPrerequisites: [],
          missingCorequisites: [],
        };
      }

      const prerequisites = courseRequisites.filter(
        (r) => r.type === "prerequisite"
      );
      const corequisites = courseRequisites.filter(
        (r) => r.type === "corequisite"
      );

      const missingPrerequisites = prerequisites
        .filter((r) => !passedCourseIds.has(r.requisiteCourseId))
        .map((r) => ({
          id: r.requisiteCourse.id,
          name: r.requisiteCourse.name,
          type: "prerequisite",
          ruleName: r.ruleName,
        }));

      const missingCorequisites = corequisites
        .filter((r) => !passedCourseIds.has(r.requisiteCourseId))
        .map((r) => ({
          id: r.requisiteCourse.id,
          name: r.requisiteCourse.name,
          type: "corequisite",
          ruleName: r.ruleName,
        }));

      // Student is eligible only if they have passed all prerequisites
      // Corequisites can be taken at the same time, so they don't block enrollment
      const eligible = missingPrerequisites.length === 0;

      return {
        courseId,
        eligible,
        missingPrerequisites,
        missingCorequisites,
      };
    });

    res.json(result);
  } catch (error) {
    console.error("Error checking student requisites:", error);
    res.status(500).json({ error: "Failed to check student requisites." });
  }
};

export default {
  listRequisites,
  createRequisite,
  updateRequisite,
  deleteRequisite,
  checkStudentRequisites,
};
