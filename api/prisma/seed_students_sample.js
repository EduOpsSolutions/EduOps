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

// Generate random civil status
function getRandomCivilStatus() {
  const statuses = ["Single", "Married", "Divorced", "Widowed"];
  return statuses[Math.floor(Math.random() * statuses.length)];
}

// Generate random address
function generateAddress(index) {
  const streets = [
    "Main St",
    "Oak Ave",
    "Maple Dr",
    "Pine Rd",
    "Elm St",
    "Cedar Ln",
    "Washington Blvd",
    "Lincoln Ave",
    "Park St",
    "River Rd",
  ];
  const cities = [
    "Springfield",
    "Riverside",
    "Fairview",
    "Georgetown",
    "Clinton",
    "Madison",
    "Salem",
    "Bristol",
    "Franklin",
    "Ashland",
  ];
  const states = ["CA", "TX", "FL", "NY", "PA", "IL", "OH", "GA", "NC", "MI"];

  const streetNum = 100 + (index * 123) % 9900;
  const street = streets[index % streets.length];
  const city = cities[index % cities.length];
  const state = states[index % states.length];
  const zip = 10000 + (index * 456) % 89999;

  return `${streetNum} ${street}, ${city}, ${state} ${zip}`;
}

// Generate random phone number
function generatePhoneNumber(seed) {
  const areaCode = 200 + (seed % 799);
  const exchange = 200 + ((seed * 13) % 799);
  const lineNumber = 1000 + ((seed * 17) % 8999);
  return `${areaCode}-${exchange}-${lineNumber}`;
}

// Generate enrollment ID
function generateEnrollmentId(counter) {
  const currentYear = new Date().getFullYear();
  return `ENR${currentYear}${counter.toString().padStart(6, "0")}`;
}

async function seedStudents() {
  console.log("🌱 Starting to seed 50 enrollment requests...");

  // Get the highest existing student counter for this year
  const currentYear = new Date().getFullYear();
  const basePattern = `S${currentYear}`;

  const existingUsers = await prisma.users.findMany({
    where: {
      userId: {
        startsWith: basePattern,
      },
    },
    select: {
      userId: true,
    },
    orderBy: {
      userId: "desc",
    },
  });

  let counter = 1;
  if (existingUsers.length > 0) {
    const latestUserId = existingUsers[0].userId;
    const counterPart = latestUserId.slice(basePattern.length);
    const latestCounter = parseInt(counterPart, 10);
    if (!isNaN(latestCounter)) {
      counter = latestCounter + 1;
    }
  }

  // Get the highest existing enrollment counter
  const existingEnrollments = await prisma.enrollment_request.findMany({
    where: {
      enrollmentId: {
        startsWith: `ENR${currentYear}`,
      },
    },
    select: {
      enrollmentId: true,
    },
    orderBy: {
      enrollmentId: "desc",
    },
  });

  let enrollmentCounter = 1;
  if (existingEnrollments.length > 0) {
    const latestEnrollmentId = existingEnrollments[0].enrollmentId;
    const counterPart = latestEnrollmentId.slice(`ENR${currentYear}`.length);
    const latestEnrollCounter = parseInt(counterPart, 10);
    if (!isNaN(latestEnrollCounter)) {
      enrollmentCounter = latestEnrollCounter + 1;
    }
  }

  // Get active academic periods for enrollment requests
  const activePeriods = await prisma.academic_period.findMany({
    where: {
      deletedAt: null,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 1,
  });

  // Get available courses
  const availableCourses = await prisma.course.findMany({
    where: {
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
    },
  });

  // Valid enrollment statuses based on the workflow
  // Only VERIFIED, APPROVED, and COMPLETED should have user accounts created
  const enrollmentStatuses = [
    "PENDING",
    "VERIFIED",
    "PAYMENT_PENDING",
    "APPROVED",
    "COMPLETED",
    "REJECTED",
  ];

  const enrollmentRequests = [];
  const studentsToCreate = []; // Only students with verified/approved/completed status

  for (let i = 0; i < 50; i++) {
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[i % lastNames.length];
    const middleName = middleNames[i % middleNames.length];
    const birthInfo = getRandomBirthDate();
    const studentId = `${basePattern}${(counter + i).toString().padStart(6, "0")}`;
    const email = generateEmail(firstName, lastName, i);
    const password = "Password123"; // Default password for all students

    // Randomly assign enrollment status with realistic distribution
    // 10% pending, 15% verified, 10% payment_pending, 40% approved, 20% completed, 5% rejected
    const rand = Math.random();
    let enrollmentStatus;
    if (rand < 0.1) {
      enrollmentStatus = "pending";
    } else if (rand < 0.25) {
      enrollmentStatus = "verified";
    } else if (rand < 0.35) {
      enrollmentStatus = "payment_pending";
    } else if (rand < 0.75) {
      enrollmentStatus = "approved";
    } else if (rand < 0.95) {
      enrollmentStatus = "completed";
    } else {
      enrollmentStatus = "rejected";
    }

    // Only create user account if enrollment is verified or beyond (not pending or rejected)
    const shouldCreateAccount = ["verified", "payment_pending", "approved", "completed"].includes(
      enrollmentStatus
    );

    if (shouldCreateAccount) {
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
      studentsToCreate.push(student);
    }

    // Create enrollment request for everyone (but only some will have accounts)
    if (availableCourses.length > 0) {
      const birthDate = new Date(
        birthInfo.birthyear,
        birthInfo.birthmonth - 1,
        birthInfo.birthdate
      );

      // Randomly select 1-3 courses
      const numCourses = Math.floor(Math.random() * 3) + 1;
      const selectedCourses = [];
      for (let c = 0; c < numCourses && c < availableCourses.length; c++) {
        const courseIndex = (i + c) % availableCourses.length;
        selectedCourses.push(availableCourses[courseIndex].name);
      }

      const enrollmentRequest = {
        enrollmentId: generateEnrollmentId(enrollmentCounter + i),
        enrollmentStatus: enrollmentStatus,
        studentId: shouldCreateAccount ? studentId : null, // Only link to user if account exists
        firstName: firstName,
        middleName: middleName,
        lastName: lastName,
        birthDate: birthDate,
        civilStatus: getRandomCivilStatus(),
        address: generateAddress(i),
        referredBy: ["Friend", "Social Media", "Walk-in", "Website", "Alumni"][
          i % 5
        ],
        contactNumber: generatePhoneNumber(i),
        altContactNumber: Math.random() > 0.5 ? generatePhoneNumber(i + 50) : null,
        preferredEmail: email,
        altEmail: Math.random() > 0.6 ? `alt.${email}` : null,
        motherName:
          Math.random() > 0.3
            ? `${firstNames[(i + 10) % firstNames.length]} ${lastName}`
            : null,
        motherContact: Math.random() > 0.3 ? generatePhoneNumber(i + 100) : null,
        fatherName:
          Math.random() > 0.3
            ? `${firstNames[(i + 20) % firstNames.length]} ${lastName}`
            : null,
        fatherContact: Math.random() > 0.3 ? generatePhoneNumber(i + 200) : null,
        guardianName: Math.random() > 0.8
          ? `${firstNames[(i + 30) % firstNames.length]} ${
              lastNames[(i + 5) % lastNames.length]
            }`
          : null,
        guardianContact:
          Math.random() > 0.8 ? generatePhoneNumber(i + 300) : null,
        coursesToEnroll: selectedCourses.join(", "),
        periodId: activePeriods.length > 0 ? activePeriods[0].id : null,
      };

      enrollmentRequests.push(enrollmentRequest);
    }
  }

  try {
    // Create enrollment requests first (all 50)
    console.log(`📝 Creating ${enrollmentRequests.length} enrollment requests...`);
    for (const request of enrollmentRequests) {
      await prisma.enrollment_request.upsert({
        where: { enrollmentId: request.enrollmentId },
        update: request,
        create: request,
      });
    }
    console.log(`✅ Successfully created ${enrollmentRequests.length} enrollment requests!`);

    // Create user accounts only for verified/approved/completed students
    console.log(`📝 Creating ${studentsToCreate.length} student accounts (only for verified/approved/completed)...`);
    for (const student of studentsToCreate) {
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

    console.log(`✅ Successfully seeded ${studentsToCreate.length} student accounts!`);
    console.log(`\n📊 Summary:`);
    console.log(`   - Total enrollment requests: ${enrollmentRequests.length}`);
    console.log(`   - Student accounts created: ${studentsToCreate.length}`);
    console.log(`   - Enrollment requests without accounts: ${enrollmentRequests.length - studentsToCreate.length}`);
    console.log(`     (These are PENDING or REJECTED status)`);
    console.log("\n📋 Default password for all students: Password123");

    if (studentsToCreate.length > 0) {
      console.log("\n📧 Sample student credentials with accounts:");
      studentsToCreate.slice(0, 5).forEach((student) => {
        const request = enrollmentRequests.find(r => r.studentId === student.userId);
        console.log(`   - User ID: ${student.userId} | Email: ${student.email} | Status: ${request?.enrollmentStatus || 'N/A'}`);
      });
      if (studentsToCreate.length > 5) {
        console.log(`   ... and ${studentsToCreate.length - 5} more`);
      }
    }
  } catch (error) {
    console.error("❌ Error seeding:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding function
seedStudents().catch((error) => {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
});
