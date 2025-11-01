import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import bcrypt from 'bcrypt';
import crypto from 'crypto';
const SALT = parseInt(process.env.BCRYPT_SALT);
import { verifyJWT } from '../utils/jwt.js';
import { uploadFile } from '../utils/fileStorage.js';
import { getUserByEmail } from '../model/user_model.js';
import { getUsersByRole as getUsersByRolesModel } from '../model/user_model.js';
import { createLog, logSecurityEvent, LogTypes } from '../utils/logger.js';
import { MODULE_TYPES } from '../constants/module_types.js';
import { sendEmailChangeNotification } from '../services/userEmailChangeService.js';

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

    const users = await prisma.users.findMany({
      select: {
        id: true,
        userId: true,
        firstName: true,
        middleName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        birthyear: true,
        birthmonth: true,
        birthdate: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
        profilePicLink: true,
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

    await createLog({
      title: `User created successfully: ${user.userId}`,
      userId: user.userId,
      reqBody: JSON.stringify(req.body),
      moduleType: MODULE_TYPES.AUTH,
      content: `User created successfully: [${user.userId}] - ${user.firstName} ${user.lastName}`,
      type: LogTypes.USER_ACTIVITY,
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
    const userRequest = await verifyJWT(
      req.headers.authorization.split(' ')[1]
    );

    // Get current user data before update to track changes
    const userBeforeUpdate = await prisma.users.findUnique({
      where: { id },
      select: {
        userId: true,
        firstName: true,
        middleName: true,
        lastName: true,
        birthmonth: true,
        birthdate: true,
        birthyear: true,
        email: true,
        phoneNumber: true,
        status: true,
        role: true,
        profilePicLink: true,
      },
    });

    if (!userBeforeUpdate) {
      return res.status(404).json({
        error: true,
        message: 'User not found',
      });
    }

    // Create an object with only the fields that are present in req.body
    const updateData = {};
    if (req.body.userId) updateData.userId = req.body.userId;
    if (req.body.firstName) updateData.firstName = req.body.firstName;
    if (req.body.middleName !== undefined)
      updateData.middleName = req.body.middleName;
    if (req.body.lastName) updateData.lastName = req.body.lastName;
    if (req.body.birthmonth) updateData.birthmonth = req.body.birthmonth;
    if (req.body.birthdate) updateData.birthdate = req.body.birthdate;
    if (req.body.birthyear) updateData.birthyear = req.body.birthyear;
    if (req.body.email) updateData.email = req.body.email;
    if (req.body.phoneNumber !== undefined)
      updateData.phoneNumber = req.body.phoneNumber;
    if (req.body.password)
      updateData.password = bcrypt.hashSync(req.body.password, SALT);
    if (req.body.status) updateData.status = req.body.status;
    if (req.body.role) updateData.role = req.body.role;
    if (req.body.profilePicLink !== undefined)
      updateData.profilePicLink = req.body.profilePicLink;

    const requesting_user_details = userRequest.payload.data;

    // Send email notification if email is being changed
    if (updateData.email && userBeforeUpdate.email !== updateData.email) {
      try {
        const adminName = `${requesting_user_details.firstName} ${requesting_user_details.lastName}`;
        const userName = `${userBeforeUpdate.firstName} ${userBeforeUpdate.lastName}`;

        await sendEmailChangeNotification(
          userBeforeUpdate.email, // Send to OLD email
          updateData.email, // New email
          userName,
          `Admin: ${adminName}`
        );

        console.log(
          `Email change notification sent to ${userBeforeUpdate.email}`
        );
      } catch (emailError) {
        console.error('Failed to send email change notification:', emailError);
        // Don't block the update if email fails, but log it
      }
    }

    const result = await prisma.users.update({
      where: { id },
      data: updateData,
    });

    // Build detailed change log
    const changes = [];
    const fieldMapping = {
      userId: 'User ID',
      firstName: 'First Name',
      middleName: 'Middle Name',
      lastName: 'Last Name',
      email: 'Email',
      phoneNumber: 'Phone Number',
      status: 'Status',
      role: 'Role',
      profilePicLink: 'Profile Picture',
    };

    // Handle birthdate changes as a single field
    if (
      updateData.hasOwnProperty('birthmonth') ||
      updateData.hasOwnProperty('birthdate') ||
      updateData.hasOwnProperty('birthyear')
    ) {
      const oldBirthdate = `${userBeforeUpdate.birthyear || ''}-${String(
        userBeforeUpdate.birthmonth || ''
      ).padStart(2, '0')}-${String(userBeforeUpdate.birthdate || '').padStart(
        2,
        '0'
      )}`;
      const newBirthdate = `${
        updateData.birthyear || userBeforeUpdate.birthyear || ''
      }-${String(
        updateData.birthmonth || userBeforeUpdate.birthmonth || ''
      ).padStart(2, '0')}-${String(
        updateData.birthdate || userBeforeUpdate.birthdate || ''
      ).padStart(2, '0')}`;

      if (oldBirthdate !== newBirthdate) {
        changes.push(`Birthdate: "${oldBirthdate}" → "${newBirthdate}"`);
      }
    }

    for (const [key, displayName] of Object.entries(fieldMapping)) {
      if (updateData.hasOwnProperty(key) && key !== 'password') {
        const oldValue = userBeforeUpdate[key] || 'null';
        const newValue = updateData[key] || 'null';

        if (oldValue !== newValue) {
          if (key === 'profilePicLink') {
            changes.push(`${displayName}: ${oldValue ? 'Changed' : 'Added'}`);
          } else {
            changes.push(`${displayName}: "${oldValue}" → "${newValue}"`);
          }
        }
      }
    }

    if (updateData.password) {
      changes.push('Password: Updated');
    }

    const changeLog =
      changes.length > 0 ? changes.join(', ') : 'No changes detected';

    logSecurityEvent(
      'User account updated',
      requesting_user_details.userId,
      MODULE_TYPES.AUTH,
      `Admin [${requesting_user_details.userId}] ${requesting_user_details.firstName} ${requesting_user_details.lastName} updated user [${result.userId}] ${result.firstName} ${result.lastName}. Changes: ${changeLog}`
    );

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
    const userRequest = await verifyJWT(
      req.headers.authorization.split(' ')[1]
    );
    const requesting_user_details = userRequest.payload.data;

    const deleted = await prisma.users.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await logSecurityEvent(
      'User deleted',
      requesting_user_details.userId,
      MODULE_TYPES.AUTH,
      `Admin [${requesting_user_details.userId}] ${requesting_user_details.firstName} ${requesting_user_details.lastName} deleted user [${deleted.userId}] ${deleted.firstName} ${deleted.lastName} at ${deleted.deletedAt} server time.`
    );

    res.json({ error: false, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: true, message: 'Error deleting user' });
  }
};

const deactivateUser = async (req, res) => {
  try {
    const { id } = req.query;
    const userRequest = await verifyJWT(
      req.headers.authorization.split(' ')[1]
    );
    const requesting_user_details = userRequest.payload.data;

    const deactivated = await prisma.users.update({
      where: { id },
      data: { status: 'disabled' },
    });

    await logSecurityEvent(
      'User deactivated',
      requesting_user_details.userId,
      MODULE_TYPES.AUTH,
      `Admin [${requesting_user_details.userId}] ${requesting_user_details.firstName} ${requesting_user_details.lastName} deactivated user [${deactivated.userId}] ${deactivated.firstName} ${deactivated.lastName} at ${deactivated.updatedAt} server time.`
    );
    res.json({ error: false, message: 'User deactivated successfully' });
  } catch (error) {
    res.status(500).json({ error: true, message: 'Error deactivating user' });
  }
};

const activateUser = async (req, res) => {
  try {
    const { id } = req.query;
    const userRequest = await verifyJWT(
      req.headers.authorization.split(' ')[1]
    );
    const requesting_user_details = userRequest.payload.data;

    const activated = await prisma.users.update({
      where: { id },
      data: { status: 'active', deletedAt: null },
    });

    await logSecurityEvent(
      'User activated',
      requesting_user_details.userId,
      MODULE_TYPES.AUTH,
      `Admin [${requesting_user_details.userId}] ${requesting_user_details.firstName} ${requesting_user_details.lastName} activated user [${activated.userId}] ${activated.firstName} ${activated.lastName} at ${activated.updatedAt} server time.`
    );
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
  const user = await getUserByEmail(decoded.email);
  if (user.error) {
    return res.status(404).json({ error: true, message: 'User not found' });
  }
  try {
    await prisma.users.update({
      where: { id: user.data.id },
      data: { password: bcrypt.hashSync(password, SALT) },
    });
    await logSecurityEvent(
      'Password changed successfully',
      user.data.id,
      MODULE_TYPES.AUTH,
      'password_changed'
    );
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
      birthdate,
      birthyear,
      email,
    } = req.body;

    // Accept either birthdate or birthyear field
    const birthdateValue = birthdate || birthyear;

    if (!birthdateValue) {
      return res.status(400).json({
        error: true,
        message: 'Birth date is required',
      });
    }

    const birthYear = new Date(birthdateValue).getFullYear();
    const birthMonth = new Date(birthdateValue).getMonth() + 1;
    const birthDay = new Date(birthdateValue).getDate();

    // Validate required fields
    if (!email || !firstName || !lastName) {
      return res.status(400).json({
        error: true,
        message: 'Email, first name, and last name are required',
      });
    }

    // Check if userId is provided and taken
    if (userId) {
      const isUserIdTaken = await prisma.users.findUnique({
        where: { userId },
      });

      if (isUserIdTaken) {
        return res
          .status(400)
          .json({ error: true, message: 'User ID already taken' });
      }
    }

    // Check if email is taken
    const isEmailTaken = await prisma.users.findUnique({
      where: { email },
    });

    if (isEmailTaken) {
      return res
        .status(400)
        .json({ error: true, message: 'Email already taken' });
    }

    // Auto-generate password: 4 letters of last name + 4 letters of first name + birth year
    const lastNamePart = lastName.substring(0, 4).toUpperCase();
    const firstNamePart = firstName.substring(0, 4).toUpperCase();
    const autoPassword = `${lastNamePart}${firstNamePart}${birthYear}`;

    const user = await prisma.users.create({
      data: {
        userId: userId || `student_${Date.now()}`, // Generate userId if not provided
        firstName,
        middleName,
        lastName,
        birthmonth: birthMonth,
        birthdate: birthDay,
        birthyear: birthYear,
        email,
        password: bcrypt.hashSync(autoPassword, SALT),
        status: 'active',
        role: 'student',
        changePassword: true, // Force password change on first login
      },
    });

    // Link the created user to the specific enrollment request using enrollmentId
    if (req.body.enrollmentId) {
      await prisma.enrollment_request.update({
        where: { enrollmentId: req.body.enrollmentId },
        data: { studentId: user.userId },
      });
    }

    await createLog({
      title: `Student account created`,
      userId: user.userId,
      moduleType: MODULE_TYPES.AUTH,
      content: `Student account for [${user.userId}] - ${user.firstName} ${user.lastName} created.`,
      reqBody: JSON.stringify(req.body),
      type: LogTypes.SECURITY_LOG,
    });

    res.status(201).json({
      error: false,
      message: 'User created successfully',
      data: {
        id: user.id,
        userId: user.userId,
        email: user.email,
      },
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

// Search students with enrollment indicator for a course within an academic period
const searchStudentsForCoursePeriod = async (req, res) => {
  try {
    const {
      q,
      periodId,
      courseId,
      take = 20,
      page = 1,
      enrolledOnly,
    } = req.query;

    if (!periodId || !courseId) {
      return res
        .status(400)
        .json({ error: true, message: 'periodId and courseId are required' });
    }

    // If the request is specifically for enrolled students only, pull directly from user_schedule
    if (String(enrolledOnly) === 'true') {
      const enrolled = await prisma.user_schedule.findMany({
        where: {
          deletedAt: null,
          schedule: {
            deletedAt: null,
            courseId,
            periodId,
          },
          user: {
            deletedAt: null,
            role: 'student',
            ...(q
              ? {
                  OR: [
                    { userId: { contains: q } },
                    { firstName: { contains: q } },
                    { middleName: { contains: q } },
                    { lastName: { contains: q } },
                    { email: { contains: q } },
                  ],
                }
              : {}),
          },
        },
        include: {
          user: {
            select: {
              id: true,
              userId: true,
              firstName: true,
              middleName: true,
              lastName: true,
              email: true,
              status: true,
            },
          },
        },
        take: parseInt(take),
        skip: (parseInt(page) - 1) * parseInt(take),
      });

      const data = enrolled
        .map((e) => e.user)
        .filter(Boolean)
        .map((s) => ({
          ...s,
          name: `${s.firstName}${s.middleName ? ' ' + s.middleName : ''} ${
            s.lastName
          }`.trim(),
          enrolledInCourse: true,
        }));

      return res.json(data);
    }

    // Otherwise, search students and annotate whether enrolled
    const whereClause = {
      role: 'student',
      deletedAt: null,
      ...(q
        ? {
            OR: [
              { userId: { contains: q } },
              { firstName: { contains: q } },
              { middleName: { contains: q } },
              { lastName: { contains: q } },
              { email: { contains: q } },
            ],
          }
        : {}),
    };

    const students = await prisma.users.findMany({
      where: whereClause,
      select: {
        id: true,
        userId: true,
        firstName: true,
        middleName: true,
        lastName: true,
        email: true,
        status: true,
      },
      take: parseInt(take),
      skip: (parseInt(page) - 1) * parseInt(take),
      orderBy: { createdAt: 'desc' },
    });

    const studentIds = students.map((s) => s.id);

    const userSchedules = await prisma.user_schedule.findMany({
      where: {
        userId: { in: studentIds },
        deletedAt: null,
        schedule: {
          deletedAt: null,
          courseId,
          periodId: periodId,
        },
      },
      select: { userId: true },
    });

    const enrolledSet = new Set(userSchedules.map((us) => us.userId));

    const data = students.map((s) => ({
      ...s,
      name: `${s.firstName}${s.middleName ? ' ' + s.middleName : ''} ${
        s.lastName
      }`.trim(),
      enrolledInCourse: enrolledSet.has(s.id),
    }));

    res.json(data);
  } catch (error) {
    console.error('searchStudentsForCoursePeriod error', error);
    res.status(500).json({ error: true, message: 'Failed to search students' });
  }
};

// Check schedule conflicts for a student within an academic period
const checkStudentScheduleConflicts = async (req, res) => {
  try {
    const { studentId, periodId, days, time_start, time_end } = req.body;

    if (!studentId || !periodId || !days || !time_start || !time_end) {
      return res.status(400).json({
        error: true,
        message:
          'studentId, periodId, days, time_start and time_end are required',
      });
    }

    const daysArray = days.split(',').map((d) => d.trim());

    // Get all schedules the student is already attached to within the period
    const existing = await prisma.user_schedule.findMany({
      where: {
        userId: studentId,
        deletedAt: null,
        schedule: {
          deletedAt: null,
          periodId,
        },
      },
      include: {
        schedule: true,
      },
    });

    const conflicts = existing.filter((us) => {
      const s = us.schedule;
      if (!s) return false;
      const scheduleDays = (s.days || '').split(',').map((d) => d.trim());
      const daysOverlap = daysArray.some((d) => scheduleDays.includes(d));
      if (!daysOverlap) return false;

      const timeOverlap =
        time_start < (s.time_end || '') && time_end > (s.time_start || '');
      return timeOverlap;
    });

    res.json({
      hasConflicts: conflicts.length > 0,
      conflicts: conflicts.map((c) => ({
        scheduleId: c.scheduleId,
        days: c.schedule?.days,
        time_start: c.schedule?.time_start,
        time_end: c.schedule?.time_end,
        courseId: c.schedule?.courseId,
      })),
    });
  } catch (error) {
    console.error('checkStudentScheduleConflicts error', error);
    res
      .status(500)
      .json({ error: true, message: 'Failed to check schedule conflicts' });
  }
};

const updateProfilePicture = async (req, res) => {
  try {
    const profilePic = req.file;

    if (!profilePic) {
      return res.status(400).json({
        error: true,
        message: 'No profile picture file provided',
      });
    }

    // Extract user ID from JWT token
    const token = req.headers.authorization.split(' ')[1];
    const decoded = await verifyJWT(token);

    if (!decoded || !decoded.payload) {
      return res.status(401).json({
        error: true,
        message: 'Invalid or expired token',
      });
    }

    // Get user by email from JWT payload
    const userResult = await getUserByEmail(decoded.payload.data.email);
    if (userResult.error) {
      return res.status(404).json({
        error: true,
        message: 'User not found',
      });
    }

    const result = await uploadFile(profilePic, 'user-profile');
    if (!result) {
      return res
        .status(400)
        .json({ error: true, message: 'Error uploading profile picture' });
    }

    // Use the user ID from the JWT token
    const user = await prisma.users.update({
      where: { id: userResult.data.id },
      data: { profilePicLink: result.downloadURL },
    });

    res.json({
      error: false,
      message: 'Profile picture updated successfully',
      data: {
        id: user.id,
        profilePicLink: user.profilePicLink,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: 'Error updating profile picture',
      error_details: error.message,
      error_info: error,
    });
  }
};

const removeProfilePicture = async (req, res) => {
  try {
    // Extract user ID from JWT token
    const token = req.headers.authorization.split(' ')[1];
    const decoded = await verifyJWT(token);

    if (!decoded || !decoded.payload) {
      return res.status(401).json({
        error: true,
        message: 'Invalid or expired token',
      });
    }

    // Get user by email from JWT payload
    const userResult = await getUserByEmail(decoded.payload.data.email);
    if (userResult.error) {
      return res.status(404).json({
        error: true,
        message: 'User not found',
      });
    }

    // Use the user ID from the JWT token to remove profile picture
    const user = await prisma.users.update({
      where: { id: userResult.data.id },
      data: { profilePicLink: null },
    });

    res.json({
      error: false,
      message: 'Profile picture removed successfully',
      data: {
        id: user.id,
        profilePicLink: user.profilePicLink,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: 'Error removing profile picture',
      error_details: error.message,
      error_info: error,
    });
  }
};

// Get student by ID (userId)
const getStudentById = async (req, res) => {
  const { studentId } = req.params;

  if (!studentId) {
    return res.status(400).json({
      error: true,
      success: false,
      message: 'Student ID is required',
    });
  }

  try {
    const student = await prisma.users.findFirst({
      where: {
        userId: studentId,
        role: 'STUDENT',
        deletedAt: null,
      },
      select: {
        id: true,
        userId: true,
        firstName: true,
        middleName: true,
        lastName: true,
        email: true,
      },
    });

    if (!student) {
      return res.status(404).json({
        error: true,
        success: false,
        message: 'Student not found with the provided ID',
      });
    }

    res.json({
      error: false,
      success: true,
      data: student,
      message: 'Student found successfully',
    });
  } catch (error) {
    console.error('Error fetching student by ID:', error);
    res.status(500).json({
      error: true,
      success: false,
      message: 'Server error while fetching student',
      error_details: error.message,
    });
  }
};

const getUsersByRole = async (req, res) => {
  const { role } = req.params;
  try {
    const users = await getUsersByRolesModel(role);
    if (!users || users.error) {
      return res.status(404).json({
        error: true,
        success: false,
        message: 'Users not found',
      });
    }

    res.json({ error: false, success: true, data: users.data });
  } catch (error) {
    console.error('Error fetching users by role:', error);
    return {
      error: true,
      message: 'Server error while fetching users by role',
      error_details: error.message,
    };
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
  searchStudentsForCoursePeriod,
  checkStudentScheduleConflicts,
  updateProfilePicture,
  removeProfilePicture,
  getStudentById,
  getUsersByRole,
};
