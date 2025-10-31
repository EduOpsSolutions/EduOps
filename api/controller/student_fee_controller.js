import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Create a new student fee
export const createStudentFee = async (req, res) => {
  try {
    const data = req.body;
    // Ensure deletedAt is not set on creation
    delete data.deletedAt;
    const studentFee = await prisma.student_fee.create({ data });
    res.status(201).json(studentFee);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create student fee.' });
  }
};

// Get all student fees (with optional filters, exclude soft-deleted)
export const listStudentFees = async (req, res) => {
  try {
    const { studentId, courseId, batchId, type } = req.query;
    const where = { deletedAt: null };
    if (studentId) where.studentId = studentId;
    if (courseId) where.courseId = courseId;
    if (batchId) where.batchId = batchId;
    if (type) where.type = type;
    const studentFees = await prisma.student_fee.findMany({ where });
    res.json(studentFees);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch student fees.' });
  }
};

// Get a single student fee by ID (exclude soft-deleted)
export const getStudentFee = async (req, res) => {
  try {
    const { id } = req.params;
    const studentFee = await prisma.student_fee.findFirst({ where: { id, deletedAt: null } });
    if (!studentFee) return res.status(404).json({ error: 'Student fee not found.' });
    res.json(studentFee);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch student fee.' });
  }
};

// Update a student fee by ID (exclude soft-deleted)
export const updateStudentFee = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    // Only update if not soft-deleted
    const existing = await prisma.student_fee.findFirst({ where: { id, deletedAt: null } });
    if (!existing) return res.status(404).json({ error: 'Student fee not found.' });
    const studentFee = await prisma.student_fee.update({ where: { id }, data });
    res.json(studentFee);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update student fee.' });
  }
};

// Soft delete a student fee by ID (set deletedAt)
export const deleteStudentFee = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.student_fee.findFirst({ where: { id, deletedAt: null } });
    if (!existing) return res.status(404).json({ error: 'Student fee not found.' });
    await prisma.student_fee.update({ where: { id }, data: { deletedAt: new Date() } });
    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete student fee.' });
  }
};

export default {
  createStudentFee,
  listStudentFees,
  getStudentFee,
  updateStudentFee,
  deleteStudentFee,
};
