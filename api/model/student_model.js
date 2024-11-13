import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function getUserByEmail(email) {
  try {
    const data = await prisma.student.findUnique({ where: { email } });
    return {
      error: false,
      data,
      role: "student",
    };
  } catch (error) {
    console.error(error);
    return {
      error: true,
      message: error.message,
    };
  }
}

export { getUserByEmail };
