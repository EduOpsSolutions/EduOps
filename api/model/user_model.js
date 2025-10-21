import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getUserByEmail(email) {
  try {
    let data = await prisma.users.findUnique({
      where: { email, deletedAt: null },
    });
    if (!data) {
      return {
        error: true,
        message: 'Account does not exist',
      };
    }
    return {
      error: false,
      data,
    };
  } catch (error) {
    console.error(error);
    return {
      error: true,
      message: error.message,
    };
  }
}

async function getUserByToken(token) {
  console.log('token', token);
  try {
    let data = await prisma.users.findFirst({
      where: {
        resetToken: token,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        middleName: true,
        lastName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        resetToken: true,
        resetTokenExpiry: true,
        // Excluding sensitive fields like password, resetToken, resetTokenExpiry
      },
    });
    console.log('data', data);

    if (!data) {
      return {
        error: true,
        message: 'Invalid or expired token',
      };
    }
    if (!data) {
      return {
        error: true,
        message: 'Invalid or expired token',
      };
    }
    return {
      error: false,
      data,
    };
  } catch (error) {
    console.error(error);
    return {
      error: true,
      message: error.message,
    };
  }
}

export async function updateUserPassword(email, hashedPassword) {
  try {
    const result = await prisma.users.update({
      where: {
        email: email,
        deletedAt: null,
      },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });
    if (result) {
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error updating password:', error);
    return false;
  }
}

export async function getUsersByRole(role) {
  if (!role) {
    return {
      error: true,
      message: 'Role is required',
    };
  }
  try {
    const users = await prisma.users.findMany({
      where: { role, deletedAt: null },
    });
    return {
      error: false,
      data: users,
    };
  } catch (error) {
    console.error('Error getting users by role:', error);
    return {
      error: true,
      message: error.message,
    };
  }
}

export { getUserByEmail, getUserByToken };
