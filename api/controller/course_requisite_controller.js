import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// List all requisites for a course
export const listRequisites = async (req, res) => {
  const { courseId } = req.query;
  try {
    if (!courseId) {
      return res.status(400).json({ error: 'Missing courseId query parameter.' });
    }
    const requisites = await prisma.course_requisite.findMany({
      where: { courseId },
      include: {
        requisiteCourse: true,
      },
    });
    res.json(requisites);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch requisites.' });
  }
};

// Create a new requisite
export const createRequisite = async (req, res) => {
  const { courseId, requisiteCourseId, type, ruleName } = req.body;
  try {
    // Prevent self-requisite
    if (courseId === requisiteCourseId) {
      return res.status(400).json({ error: 'A course cannot be its own requisite.' });
    }
    // Prevent duplicate
    const existing = await prisma.course_requisite.findFirst({
      where: {
        courseId,
        requisiteCourseId,
      },
    });
    if (existing) {
      return res.status(400).json({ error: 'This course-requisite pair already exists.' });
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
    res.status(500).json({ error: 'Failed to create requisite.' });
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
    res.status(500).json({ error: 'Failed to update requisite.' });
  }
};

// Delete a requisite
export const deleteRequisite = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.course_requisite.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete requisite.' });
  }
};

export default {
    listRequisites,
    createRequisite,
    updateRequisite,
    deleteRequisite
}
