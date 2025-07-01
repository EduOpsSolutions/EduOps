import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
import { sendEmail } from '../utils/mailer';

function generateRandomId() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';

  let randomLetters = '';
  for (let i = 0; i < 5; i++) {
    randomLetters += letters.charAt(Math.floor(Math.random() * letters.length));
  }

  let randomNumbers = '';
  for (let i = 0; i < 3; i++) {
    randomNumbers += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }

  return randomLetters + randomNumbers;
}

async function generateEnrollmentId() {
  let newId;
  let exists = true;

  while (exists) {
    newId = generateRandomId();
    exists = await prisma.enrollment_request.findUnique({
      where: { enrollmentId: newId },
    });
  }

  return newId;
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

    const validIdPath = req.files?.validId ? req.files.validId[0].path : null;
    const idPhotoPath = req.files?.idPhoto ? req.files.idPhoto[0].path : null;

    const enrollmentId = await generateEnrollmentId();

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

    const email = sendEmail(
      preferredEmail,
      `Enrollment Request: Enrollee Copy`,
      '',
      `
      <p>Dear ${firstName},</p>
      <br>
      <p>You have sent an enrollment request to Sprach Institut Cebu Inc., and here is what we've received. We shall be processing your enrollment using the provided information. Please be advised that you may be contacted for further details.</p>
      <table>
        <tr><td>First Name</td><${firstName}></tr>
      <tr><td>Middle Name</td><${middleName}></tr>
      
      <table>
      `
    );

    res.status(201).json({
      error: false,
      message: 'Enrollment request created successfully',
      data: enrollmentRequest,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, error: true });
  }
};

export { createEnrollmentRequest };
