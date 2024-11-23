import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function getUserByEmail(email) {
  try {
    let data = await prisma.users.findUnique({
      where: { email, deletedAt: null },
    });
    data.role = "student";
    if (!data) {
      return {
        error: true,
        message: "Account does not exist",
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
    let data = await prisma.users.findUnique({ where: { resetToken: token } });
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

export { getUserByEmail, getUserByToken };