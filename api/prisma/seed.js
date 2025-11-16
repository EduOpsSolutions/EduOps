import pkg from "@prisma/client";
const { PrismaClient } = pkg;
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
      status: "active",
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
      userId: "S2025000001",
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
      userId: "S2025000001",
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
      userId: "T2025000001",
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
      userId: "T2025000001",
      status: "active",
      role: "teacher",
    },
  });

  /* END SEEDING USERS */

  /* START SEEDING DOCUMENT TEMPLATES */
  // Add sample document templates
  const documentTemplates = [
    {
      documentName: "Certificate of Enrollment",
      description: "Official certificate proving student enrollment status",
      privacy: "student_only",
      requestBasis: true,
      downloadable: false,
      price: "free",
      amount: null,
      isActive: true,
    },
    {
      documentName: "Transcript of Records",
      description: "Academic transcript showing all courses and grades",
      privacy: "student_only",
      requestBasis: true,
      downloadable: false,
      price: "paid",
      amount: 150.0,
      isActive: true,
    },
    {
      documentName: "Certificate of Grades",
      description:
        "Official certificate showing final grades for completed courses",
      privacy: "student_only",
      requestBasis: true,
      downloadable: false,
      price: "paid",
      amount: 100.0,
      isActive: true,
    },
    {
      documentName: "Good Moral Certificate",
      description:
        "Certificate of good moral standing issued by the institution",
      privacy: "student_only",
      requestBasis: true,
      downloadable: false,
      price: "paid",
      amount: 75.0,
      isActive: true,
    },
    {
      documentName: "Student ID Application Form",
      description: "Application form for new student ID card",
      privacy: "student_only",
      requestBasis: false,
      downloadable: true,
      price: "free",
      amount: null,
      isActive: true,
    },
    {
      documentName: "Course Syllabus Template",
      description: "Standard template for course syllabus creation",
      privacy: "teacher_only",
      requestBasis: false,
      downloadable: true,
      price: "free",
      amount: null,
      isActive: true,
    },
    {
      documentName: "Grading Sheet Template",
      description: "Template for recording student grades",
      privacy: "teacher_only",
      requestBasis: false,
      downloadable: true,
      price: "free",
      amount: null,
      isActive: true,
    },
    {
      documentName: "Academic Calendar",
      description: "Current academic year calendar with important dates",
      privacy: "public",
      requestBasis: false,
      downloadable: true,
      price: "free",
      amount: null,
      isActive: true,
    },
  ];

  console.log("Seeding document templates...");

  // Seed document templates using findFirst and create approach since documentName is not unique
  for (const template of documentTemplates) {
    const existingTemplate = await prisma.document_template.findFirst({
      where: { documentName: template.documentName },
    });

    if (!existingTemplate) {
      await prisma.document_template.create({
        data: template,
      });
    } else {
      // Update existing template
      await prisma.document_template.update({
        where: { id: existingTemplate.id },
        data: template,
      });
    }
  }

  console.log("Document templates seeded successfully");
  /* END SEEDING DOCUMENT TEMPLATES */
}

main();
