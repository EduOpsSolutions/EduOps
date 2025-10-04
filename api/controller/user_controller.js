import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import bcrypt from 'bcrypt';
import crypto from 'crypto';
const SALT = parseInt(process.env.BCRYPT_SALT);
import { verifyJWT } from '../utils/jwt.js';

// Get all users
const getAllUsers = async (req, res) => {
  const {
    showDeleted,
    role,
    take,
    page,
    search,
    sortBy,
    sortOrder,
    userId,
    status,
  } = req.query;
  try {
    console.log(await verifyJWT(req.headers.authorization.split(' ')[1]));
    let whereClause = {};
    if (role) whereClause.role = role;
    if (status) whereClause.status = status;
    if (showDeleted === 'true') {
      // Show both deleted and non-deleted users
      whereClause.deletedAt = undefined;
    } else {
      whereClause.deletedAt = null;
    }
    if (userId) whereClause.userId = userId;
    if (search) {
      whereClause.OR = [
        { firstName: { contains: search } },
        { middleName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
      ];
    }

    console.log('Where Clause', whereClause);

    const users = await prisma.users.findMany({
      select: {
        id: true,
        userId: true,
        firstName: true,
        middleName: true,
        lastName: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
      },
      where: whereClause,
      take: take ? parseInt(take) : 30,
      skip: page ? (parseInt(page) - 1) * take : undefined,
      // ommit: {
      //   password: true,
      // },
      ...(sortBy && {
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
    });

    const count = users.length || 0;
    const max_result = await prisma.users.count({
      where: whereClause,
    });
    const response = {
      data: users,
      count: count,
      max_result,
      page: page ? parseInt(page) : 1,
      max_page: Math.ceil(max_result / (take ? parseInt(take) : 30)),
    };
    res.json(response);
  } catch (error) {
    console.error('Error fetching users:', error);
    res
      .status(500)
      .json({ error: 'Error fetching users', details: error.message });
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
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ error: true, message: 'Error fetching student' });
  }
};

// Helper function to generate unique userId
const generateUserId = async (role) => {
  const prefix = role === 'teacher' ? 'teacher' : 'student';
  let counter = 1;
  let userId;

  do {
    userId = `${prefix}${counter.toString().padStart(3, '0')}`;
    const existingUser = await prisma.users.findUnique({
      where: { userId },
    });
    if (!existingUser) break;
    counter++;
  } while (counter < 1000); // Prevent infinite loop

  return userId;
};

// Create new student
const createUser = async (req, res) => {
  try {
    const {
      userId: providedUserId,
      firstName,
      middleName,
      lastName,
      birthmonth,
      birthdate,
      birthyear,
      email,
      password,
      role = 'student',
    } = req.body;

    // Generate userId if not provided
    let userId = providedUserId;
    if (!userId) {
      userId = await generateUserId(role);
    } else {
      // Check if provided userId is taken
      const isUserIdTaken = await prisma.users.findUnique({
        where: { userId },
      });

      if (isUserIdTaken) {
        return res
          .status(400)
          .json({ error: true, message: 'User ID already taken' });
      }
    }

    const isEmailTaken = await prisma.users.findUnique({
      where: { email },
    });

    if (isEmailTaken) {
      return res
        .status(400)
        .json({ error: true, message: 'Email already taken' });
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
        role,
        status: 'active',
      },
    });
    res.status(201).json({
      error: false,
      message: 'User created successfully',
      data: { userId: user.userId },
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
    if (req.body.profilePicLink)
      updateData.profilePicLink = req.body.profilePicLink;

    await prisma.users.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json({
      error: false,
      message: 'User updated successfully',
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

    res.json({ error: false, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: true, message: 'Error deleting user' });
  }
};

const deactivateUser = async (req, res) => {
  try {
    const { id } = req.query;
    console.log('deactivate user', id);
    await prisma.users.update({
      where: { id },
      data: { status: 'disabled' },
    });

    res.json({ error: false, message: 'User deactivated successfully' });
  } catch (error) {
    res.status(500).json({ error: true, message: 'Error deactivating user' });
  }
};

const activateUser = async (req, res) => {
  try {
    const { id } = req.query;
    await prisma.users.update({
      where: { id },
      data: { status: 'active', deletedAt: null },
    });

    res.json({ error: false, message: 'User activated successfully' });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: 'Error activating user',
      error_details: error.message,
      error_info: error,
    });
  }
};

const changePassword = async (req, res) => {
  const { password } = req.body;
  const token = req.headers.authorization.split(' ')[1];
  const decoded = await verifyJWT(token);
  console.log('decoded', decoded);
  const user = await getUserByEmail(decoded.email);
  console.log('user', user);
  if (user.error) {
    return res.status(404).json({ error: true, message: 'User not found' });
  }
  try {
    await prisma.users.update({
      where: { id: user.data.id },
      data: { password: bcrypt.hashSync(password, SALT) },
    });
    res.json({ error: false, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: 'Error changing password',
      error_message: error.message,
      error_info: error,
    });
  }
};

const createStudentAccount = async (req, res) => {
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
        .json({ error: true, message: 'User ID already taken' });
    }

    const isEmailTaken = await prisma.users.findUnique({
      where: { email },
    });

    if (isEmailTaken) {
      return res
        .status(400)
        .json({ error: true, message: 'Email already taken' });
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
        status: 'active',
      },
    });
    res.status(201).json({
      error: false,
      message: 'User created successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message, error: true });
  }
};

const inspectEmailExists = async (req, res) => {
  const { email, altEmail } = req.query;
  try {
    let user = null;
    if (!email && !altEmail) {
      return res
        .status(400)
        .json({ error: true, message: 'Email or altEmail is required' });
    }
    if (!altEmail) {
      user = await prisma.users.findFirst({
        where: {
          email,
        },
      });
    } else {
      user = await prisma.users.findFirst({
        where: {
          OR: [{ email: email }, { email: altEmail }],
        },
      });
    }
    res.json({
      error: false,
      message: 'Email exists',
      data: user ? true : false,
      user: user
        ? {
            id: user.id,
            firstName: user.firstName,
            middleName: user.middleName,
            lastName: user.lastName,
            email: user.email,
            userId: user.userId,
            status: user.status,
            role: user.role,
            profilePicLink: user.profilePicLink,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          }
        : null,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to inspect user with email',
      error: true,
      error_details: error,
      error_info: error,
    });
  }
};

export {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  deactivateUser,
  activateUser,
  changePassword,
  createStudentAccount,
  inspectEmailExists,
};
