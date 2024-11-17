import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import bcrypt from "bcrypt";
import crypto from "crypto";
const SALT = parseInt(process.env.BCRYPT_SALT);
import { verifyJWT } from "../utils/jwt.js";

// Get all users
const getAllUsers = async (req, res) => {
  const { showDeleted, role, take, page } = req.query;
  console.log(req.query);
  try {
    console.log(await verifyJWT(req.headers.authorization.split(" ")[1]));
    const students = await prisma.users.findMany({
      where: {
        deletedAt: showDeleted ? undefined : null,
        role,
      },
      take: take ? parseInt(take) : undefined,
      skip: page ? (parseInt(page) - 1) * take : undefined,
    });
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: "Error fetching students" });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await prisma.users.findUnique({
      where: { id },
    });

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ error: true, message: "Error fetching student" });
  }
};

// Create new student
const createUser = async (req, res) => {
  try {
    const {
      userId,
      firstName,
      middleName,
      lastName,
      birthmonth,
      birthdate,
      birthyear,
      email,
      password,
    } = req.body;

    const isUserIdTaken = await prisma.users.findUnique({
      where: { userId },
    });

    if (isUserIdTaken) {
      return res
        .status(400)
        .json({ error: true, message: "User ID already taken" });
    }

    const isEmailTaken = await prisma.users.findUnique({
      where: { email },
    });

    if (isEmailTaken) {
      return res
        .status(400)
        .json({ error: true, message: "Email already taken" });
    }

    const user = await prisma.users.create({
      data: {
        userId,
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
      message: "User created successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message, error: true });
  }
};

// Update student
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(req.params);

    // Create an object with only the fields that are present in req.body
    const updateData = {};
    if (req.body.userId) updateData.userId = req.body.userId;
    if (req.body.firstName) updateData.firstName = req.body.firstName;
    if (req.body.middleName) updateData.middleName = req.body.middleName;
    if (req.body.lastName) updateData.lastName = req.body.lastName;
    if (req.body.birthmonth) updateData.birthmonth = req.body.birthmonth;
    if (req.body.birthdate) updateData.birthdate = req.body.birthdate;
    if (req.body.birthyear) updateData.birthyear = req.body.birthyear;
    if (req.body.email) updateData.email = req.body.email;
    if (req.body.password)
      updateData.password = bcrypt.hashSync(req.body.password, SALT);
    if (req.body.status) updateData.status = req.body.status;

    await prisma.users.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json({
      error: false,
      message: "User updated successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message, error: true });
  }
};

// Delete student
const deleteUser = async (req, res) => {
  try {
    const { id } = req.body;

    await prisma.users.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    res.json({ error: false, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: true, message: "Error deleting user" });
  }
};

export { getAllUsers, getUserById, createUser, updateUser, deleteUser };
