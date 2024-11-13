const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");
const SALT = parseInt(process.env.BCRYPT_SALT);

// Get all students
const getAllStudents = async (req, res) => {
  try {
    const students = await prisma.student.findMany();
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: "Error fetching students" });
  }
};

// Get student by ID
const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await prisma.student.findUnique({
      where: { id },
    });

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ error: "Error fetching student" });
  }
};

// Create new student
const createStudent = async (req, res) => {
  try {
    const {
      studentId,
      firstName,
      middleName,
      lastName,
      birthmonth,
      birthdate,
      birthyear,
      email,
      password,
    } = req.body;

    const student = await prisma.student.create({
      data: {
        studentId: "S" + studentId, //prefix S to the studentId
        firstName,
        middleName,
        lastName,
        birthmonth,
        birthdate,
        birthyear,
        email,
        password: bcrypt.hashSync(password, SALT),
        status: "active",
      },
    });
    res.status(201).json({
      error: false,
      message: "Student created successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message, error: true });
  }
};

// Update student - not working properly when updating anything it requires all fields even though onlythe needed fields to be updated are needed
const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      studentId,
      firstName,
      middleName,
      lastName,
      birthmonth,
      birthdate,
      birthyear,
      email,
      password,
      status,
    } = req.body;

    const student = await prisma.student.update({
      where: { id },
      data: {
        studentId: "S" + studentId,
        firstName,
        middleName,
        lastName,
        birthmonth,
        birthdate,
        birthyear,
        email,
        password: password ? bcrypt.hashSync(password, SALT) : undefined,
        status,
      },
    });

    res.status(201).json({
      error: false,
      message: "Student updated successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message, error: true });
  }
};

// Delete student
const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.student.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting student" });
  }
};

module.exports = {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
};
