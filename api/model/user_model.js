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
  try {
    let data = await prisma.users.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(), // Only get tokens that haven't expired
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        // Excluding sensitive fields like password, resetToken, resetTokenExpiry
      },
    });
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
      },
    });
    return true;
  } catch (error) {
    console.error('Error updating password:', error);
    return false;
  }
}

export { getUserByEmail, getUserByToken };
