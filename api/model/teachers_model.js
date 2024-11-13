import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function getUserByEmail(email) {
  //return await prisma.teacher.findUnique({ where: { email } });
}

export { getUserByEmail };
