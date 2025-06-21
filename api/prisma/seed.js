import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
const SALT = parseInt(process.env.BCRYPT_SALT);
const prisma = new PrismaClient();

async function main() {
  /* START SEEDING USERS */
  const admin = await prisma.users.upsert({
    where: { email: process.env.ADMIN_EMAIL },
    update: {
      userId: process.env.ADMIN_USERID,
      password: bcrypt.hashSync(process.env.ADMIN_PASSWORD, SALT),
      firstName: process.env.ADMIN_FIRSTNAME,
      lastName: process.env.ADMIN_LASTNAME,
    },
    create: {
      email: process.env.ADMIN_EMAIL,
      password: bcrypt.hashSync(process.env.ADMIN_PASSWORD, SALT),
      userId: process.env.ADMIN_USERID,
      firstName: process.env.ADMIN_FIRSTNAME,
      lastName: process.env.ADMIN_LASTNAME,
      birthmonth: 1,
      birthdate: 1,
      birthyear: 2000,
      role: "admin",
    },
  });
  const student = await prisma.users.upsert({
    where: { email: "john@doe.com" },
    update: {
      firstName: "John",
      lastName: "Doe",
      birthmonth: 1,
      birthdate: 1,
      birthyear: 2000,
      password: bcrypt.hashSync("Password123", SALT),
      userId: "student001",
      status: "active",
      role: "student",
    },
    create: {
      email: "john@doe.com",
      firstName: "John",
      lastName: "Doe",
      birthmonth: 1,
      birthdate: 1,
      birthyear: 2000,
      userId: "student001",
      password: bcrypt.hashSync("Password123", SALT),
      status: "active",
      role: "student",
    },
  });
  const teacher = await prisma.users.upsert({
    where: { email: "jane@doe.com" },
    update: {
      firstName: "Jane",
      lastName: "Doe",
      birthmonth: 1,
      birthdate: 1,
      birthyear: 2000,
      password: bcrypt.hashSync("Password123", SALT),
      userId: "teacher001",
      status: "active",
      role: "teacher",
    },
    create: {
      email: "jane@doe.com",
      firstName: "Jane",
      lastName: "Doe",
      birthmonth: 1,
      birthdate: 1,
      birthyear: 2000,
      password: bcrypt.hashSync("Password123", SALT),
      userId: "teacher001",
      status: "active",
      role: "teacher",
    },
  });

  /* END SEEDING USERS */
}

main();
