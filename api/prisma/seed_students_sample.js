import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import bcrypt from "bcrypt";
import { generateStandardizedUserId } from "../utils/userIdGenerator.js";

const SALT = parseInt(process.env.BCRYPT_SALT) || 10;
const prisma = new PrismaClient();

// Sample data arrays for generating realistic student information
const firstNames = [
  "Emma",
  "Liam",
  "Olivia",
  "Noah",
  "Ava",
  "Ethan",
  "Isabella",
  "Lucas",
  "Sophia",
  "Mason",
  "Mia",
  "Oliver",
  "Charlotte",
  "Elijah",
  "Amelia",
  "James",
  "Harper",
  "Benjamin",
  "Evelyn",
  "Sebastian",
  "Abigail",
  "Michael",
  "Emily",
  "Daniel",
  "Elizabeth",
  "Henry",
  "Sofia",
  "Jackson",
  "Avery",
  "Samuel",
  "Ella",
  "David",
  "Madison",
  "Joseph",
  "Scarlett",
  "Carter",
  "Victoria",
  "Owen",
  "Luna",
  "Wyatt",
  "Grace",
  "John",
  "Chloe",
  "Jack",
  "Penelope",
  "Luke",
  "Layla",
  "Jayden",
  "Riley",
  "Dylan",
];

const lastNames = [
  "Smith",
  "Johnson",
  "Williams",
  "Brown",
  "Jones",
  "Garcia",
  "Miller",
  "Davis",
  "Rodriguez",
  "Martinez",
  "Hernandez",
  "Lopez",
  "Gonzalez",
  "Wilson",
  "Anderson",
  "Thomas",
  "Taylor",
  "Moore",
  "Jackson",
  "Martin",
  "Lee",
  "Perez",
  "Thompson",
  "White",
  "Harris",
  "Sanchez",
  "Clark",
  "Ramirez",
  "Lewis",
  "Robinson",
  "Walker",
  "Young",
  "Allen",
  "King",
  "Wright",
  "Scott",
  "Torres",
  "Nguyen",
  "Hill",
  "Flores",
  "Green",
  "Adams",
  "Nelson",
  "Baker",
  "Hall",
  "Rivera",
  "Campbell",
  "Mitchell",
  "Carter",
  "Roberts",
];

const middleNames = [
  "Alexander",
  "Marie",
  "James",
  "Elizabeth",
  "Michael",
  "Anne",
  "David",
  "Rose",
  "Christopher",
  "Grace",
  "Matthew",
  "Louise",
  "Andrew",
  "Jane",
  "Joshua",
  "Claire",
  "Ryan",
  "Faith",
  "Nicholas",
  "Hope",
  "Tyler",
  "Joy",
  "Brandon",
  "Peace",
  "Samuel",
  "Love",
  "Nathan",
  "Grace",
  "Christian",
  "Mercy",
  "Justin",
  "Charity",
  "Jonathan",
  "Patience",
  "Austin",
  "Temperance",
  "Robert",
  "Prudence",
  "Kevin",
  "Justice",
  "Steven",
  "Honor",
  "Timothy",
  "Virtue",
  "Jose",
  "Wisdom",
  "Adam",
  "Truth",
  "Mark",
  "Freedom",
];

// Generate random date between 1995 and 2005
function getRandomBirthDate() {
  const startYear = 1995;
  const endYear = 2005;
  const year =
    Math.floor(Math.random() * (endYear - startYear + 1)) + startYear;
  const month = Math.floor(Math.random() * 12) + 1;
  const day = Math.floor(Math.random() * 28) + 1; // Using 28 to avoid invalid dates

  return {
    birthyear: year,
    birthmonth: month,
    birthdate: day,
  };
}

// Generate random student ID using standardized format
// Now uses the centralized utility: S2025000001, S2025000002, etc.
async function generateStudentId() {
  return await generateStandardizedUserId("student");
}

// Generate random email
function generateEmail(firstName, lastName, index) {
  const domains = [
    "gmail.com",
    "yahoo.com",
    "outlook.com",
    "hotmail.com",
    "student.edu",
  ];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  const randomNum = Math.floor(Math.random() * 1000);

  const emailPatterns = [
    `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`,
    `${firstName.toLowerCase()}${lastName.toLowerCase()}@${domain}`,
    `${firstName.toLowerCase()}${lastName.toLowerCase()}${randomNum}@${domain}`,
    `${lastName.toLowerCase()}.${firstName.toLowerCase()}@${domain}`,
    `${firstName.toLowerCase()}_${lastName.toLowerCase()}@${domain}`,
  ];

  return emailPatterns[Math.floor(Math.random() * emailPatterns.length)];
}

async function seedStudents() {
  console.log("🌱 Starting to seed 50 student accounts...");

  const students = [];

  for (let i = 0; i < 50; i++) {
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[i % lastNames.length];
    const middleName = middleNames[i % middleNames.length];
    const birthInfo = getRandomBirthDate();
    const studentId = await generateStudentId(); // Now generates standardized IDs
    const email = generateEmail(firstName, lastName, i);
    const password = "Password123"; // Default password for all students

    const student = {
      userId: studentId,
      firstName: firstName,
      middleName: middleName,
      lastName: lastName,
      birthmonth: birthInfo.birthmonth,
      birthdate: birthInfo.birthdate,
      birthyear: birthInfo.birthyear,
      email: email,
      password: bcrypt.hashSync(password, SALT),
      role: "student",
      status: "active",
      firstLogin: true,
    };

    students.push(student);
  }

  try {
    // Use upsert to avoid duplicates
    for (const student of students) {
      await prisma.users.upsert({
        where: { userId: student.userId },
        update: {
          firstName: student.firstName,
          middleName: student.middleName,
          lastName: student.lastName,
          birthmonth: student.birthmonth,
          birthdate: student.birthdate,
          birthyear: student.birthyear,
          email: student.email,
          password: student.password,
          status: student.status,
          firstLogin: student.firstLogin,
        },
        create: student,
      });
    }

    console.log("✅ Successfully seeded 50 student accounts!");
    console.log("📋 Default password for all students: Password123");
    console.log("📧 Sample student credentials:");
    students.slice(0, 5).forEach((student) => {
      console.log(`   - User ID: ${student.userId} | Email: ${student.email}`);
    });
    console.log("... and 45 more");
  } catch (error) {
    console.error("❌ Error seeding students:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding function
seedStudents().catch((error) => {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
});
