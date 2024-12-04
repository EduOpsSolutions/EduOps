import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// In-memory counter (not persistent)
let enrollmentCounter = 0;

// Generate custom enrollmentId
function generateEnrollmentId() {
  enrollmentCounter += 1;
  return `eReq${String(enrollmentCounter).padStart(3, "0")}`;
}

// Create new enrollment request
const createEnrollmentRequest = async (req, res) => {
  try {
    const {
      firstName,
      middleName,
      lastName,
      birthDate,
      civilStatus,
      address,
      referredBy,
      contactNumber,
      altContactNumber,
      preferredEmail,
      altEmail,
      motherName,
      motherContact,
      fatherName,
      fatherContact,
      guardianName,
      guardianContact,
      coursesToEnroll,
    } = req.body;

    const validIdPath = null;
    const idPhotoPath = null;

    const enrollmentId = generateEnrollmentId();

    const enrollmentRequest = await prisma.enrollment_request.create({
      data: {
        enrollmentId,
        firstName,
        middleName,
        lastName,
        birthDate: new Date(birthDate),
        civilStatus,
        address,
        referredBy,
        contactNumber,
        altContactNumber,
        preferredEmail,
        altEmail,
        motherName,
        motherContact,
        fatherName,
        fatherContact,
        guardianName,
        guardianContact,
        coursesToEnroll,
        validIdPath,
        idPhotoPath,
      },
    });

    res.status(201).json({
      error: false,
      message: "Enrollment request created successfully",
      data: enrollmentRequest,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, error: true });
  }
};

export { createEnrollmentRequest };
