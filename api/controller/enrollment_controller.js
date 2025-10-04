import { PrismaClient } from '@prisma/client';
import { sendEmail } from '../utils/mailer.js';

const prisma = new PrismaClient();

function generateRandomId() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';

  const randomLetters = Array.from({ length: 5 }, () =>
    letters.charAt(Math.floor(Math.random() * letters.length))
  ).join('');

  const randomNumbers = Array.from({ length: 3 }, () =>
    numbers.charAt(Math.floor(Math.random() * numbers.length))
  ).join('');

  return randomLetters + randomNumbers;
}

// Generate unique enrollment ID
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
      validIdPath,
      idPhotoPath,
    } = req.body;

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

    const email = await sendEmail(
      preferredEmail,
      `Enrollment Request Confirmation - Sprach Institut Cebu Inc.`,
      '',
      `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Enrollment Request Confirmation</title>
        <style>
          body {
            font-family: 'Open Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background-color: #FFFDF2;
          }
          .container {
            max-width: 700px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          .header {
            background-color: #DE0000;
            color: white;
            padding: 30px 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 300;
          }
          .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
            font-size: 16px;
          }
          .content {
            padding: 30px;
          }
          .greeting {
            font-size: 18px;
            color: #333;
            margin-bottom: 20px;
          }
          .message {
            color: #555;
            margin-bottom: 30px;
            font-size: 16px;
            line-height: 1.7;
          }
          .info-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background-color: #fff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          }
          .section-header {
            background-color: #f8f9fa;
            color: #495057;
            font-weight: 600;
            padding: 15px;
            text-align: left;
            border-bottom: 2px solid #e9ecef;
            font-size: 16px;
          }
          .info-table tr:nth-child(even) {
            background-color: #f8f9fa;
          }
          .info-table td {
            padding: 12px 15px;
            border-bottom: 1px solid #e9ecef;
            vertical-align: top;
          }
          .info-table td:first-child {
            font-weight: 600;
            color: #495057;
            width: 35%;
            background-color: #f1f3f4;
          }
          .info-table td:last-child {
            color: #333;
          }
          .file-link {
            color: #890E07;
            text-decoration: none;
            font-weight: 500;
            padding: 8px 16px;
            background-color: #ffe6e6;
            border-radius: 5px;
            display: inline-block;
            transition: all 0.3s ease;
          }
          .file-link:hover {
            background-color: #890E07;
            color: white;
            text-decoration: none;
          }
          .footer {
            background-color: #f8f9fa;
            padding: 25px;
            text-align: center;
            color: #6c757d;
            font-size: 14px;
            border-top: 1px solid #e9ecef;
          }
          .enrollment-id {
            background-color: #890E07;
            color: white;
            padding: 15px;
            text-align: center;
            margin: 20px 0;
            border-radius: 8px;
            font-size: 18px;
            font-weight: 600;
          }
          .next-steps {
            background-color: #ffe6e6;
            border-left: 4px solid #DE0000;
            padding: 20px;
            margin: 25px 0;
            border-radius: 0 8px 8px 0;
          }
          .next-steps h3 {
            margin: 0 0 10px 0;
            color: #890E07;
            font-size: 18px;
          }
          .next-steps p {
            margin: 0;
            color: #555;
            line-height: 1.6;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Enrollment Request Confirmed</h1>
            <p>Sprach Institut Cebu Inc.</p>
          </div>
          
          <div class="content">
            <div class="greeting">Dear ${firstName},</div>
            
            <div class="message">
              Thank you for submitting your enrollment request to <strong>Sprach Institut Cebu Inc.</strong> 
              We have successfully received your application and all required documents. Our admissions team 
              will review your information and contact you within 2-3 business days regarding the next steps.
            </div>

            <div class="enrollment-id">
              Your Enrollment ID: <strong>${enrollmentId}</strong>
            </div>

            <div class="next-steps">
              <h3>What happens next?</h3>
              <p>Our admissions team will review your application and verify the submitted documents. 
              You may be contacted for additional information or to schedule an interview. Please keep 
              your enrollment ID for future reference.</p>
            </div>

            <h3 style="color: #333; margin-top: 30px; margin-bottom: 15px;">Application Summary</h3>

            <table class="info-table">
              <tr class="section-header">
                <td colspan="2">Personal Information</td>
              </tr>
              <tr><td>Full Name</td><td>${firstName} ${middleName || ''
      } ${lastName}</td></tr>
              <tr><td>Birth Date</td><td>${new Date(
        birthDate
      ).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })}</td></tr>
              <tr><td>Civil Status</td><td>${civilStatus}</td></tr>
              <tr><td>Address</td><td>${address}</td></tr>
              ${referredBy
        ? `<tr><td>Referred By</td><td>${referredBy}</td></tr>`
        : ''
      }
            </table>

            <table class="info-table">
              <tr class="section-header">
                <td colspan="2">Contact Information</td>
              </tr>
              <tr><td>Primary Contact</td><td>${contactNumber}</td></tr>
              ${altContactNumber
        ? `<tr><td>Alternative Contact</td><td>${altContactNumber}</td></tr>`
        : ''
      }
              <tr><td>Primary Email</td><td>${preferredEmail}</td></tr>
              ${altEmail
        ? `<tr><td>Alternative Email</td><td>${altEmail}</td></tr>`
        : ''
      }
            </table>

            ${motherName || fatherName || guardianName
        ? `
            <table class="info-table">
              <tr class="section-header">
                <td colspan="2">Emergency Contact Information</td>
              </tr>
              ${motherName
          ? `<tr><td>Mother's Name</td><td>${motherName}</td></tr>`
          : ''
        }
              ${motherContact
          ? `<tr><td>Mother's Contact</td><td>${motherContact}</td></tr>`
          : ''
        }
              ${fatherName
          ? `<tr><td>Father's Name</td><td>${fatherName}</td></tr>`
          : ''
        }
              ${fatherContact
          ? `<tr><td>Father's Contact</td><td>${fatherContact}</td></tr>`
          : ''
        }
              ${guardianName
          ? `<tr><td>Guardian's Name</td><td>${guardianName}</td></tr>`
          : ''
        }
              ${guardianContact
          ? `<tr><td>Guardian's Contact</td><td>${guardianContact}</td></tr>`
          : ''
        }
            </table>
            `
        : ''
      }

            <table class="info-table">
              <tr class="section-header">
                <td colspan="2">Academic Information</td>
              </tr>
              <tr><td>Courses to Enroll</td><td>${coursesToEnroll}</td></tr>
            </table>

            <table class="info-table">
              <tr class="section-header">
                <td colspan="2">Submitted Documents</td>
              </tr>
              <tr><td>Valid ID</td><td><a href="${validIdPath}" target="_blank" class="file-link">📄 View Document</a></td></tr>
              <tr><td>ID Photo</td><td><a href="${idPhotoPath}" target="_blank" class="file-link">📷 View Photo</a></td></tr>
            </table>
          </div>

          <div class="footer">
            <p><strong>Sprach Institut Cebu Inc.</strong></p>
            <p>Thank you for choosing us for your educational journey. If you have any questions, 
            please don't hesitate to contact our admissions office.</p>
            <p><em>This is an automated message. Please do not reply to this email.</em></p>
          </div>
        </div>
      </body>
      </html>
      `
    );
    console.log('email', email);

    res.status(201).json({
      error: false,
      message: 'Enrollment request created successfully',
      data: enrollmentRequest,
    });
  } catch (error) {
    console.error('Enrollment creation error:', error);

    let userMessage = 'Failed to create enrollment request. Please check your data and try again.';

    if (error.message.includes('idPhotoPath')) {
      userMessage = 'Invalid ID photo upload. Please try uploading your ID photo again.';
    } else if (error.message.includes('validIdPath')) {
      userMessage = 'Invalid valid ID upload. Please try uploading your valid ID again.';
    } else if (error.message.includes('email')) {
      userMessage = 'Email address is already in use or invalid.';
    }

    res.status(500).json({ message: userMessage, error: true });
  }
};

// Get enrollment requests with filtering, pagination, and search
const getEnrollmentRequests = async (req, res) => {
  const {
    id,
    status,
    page = 1,
    limit = 10,
    search,
    order = 'desc',
  } = req.query;
  const enrollmentRequests = await prisma.enrollment_request.findMany({
    where: {
      id: id,
      enrollmentStatus: status,
      ...(search && {
        OR: [
          { enrollmentId: { contains: search } },
          { firstName: { contains: search } },
          { lastName: { contains: search } },
          { preferredEmail: { contains: search } },
          { altEmail: { contains: search } },
        ],
      }),
    },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: order },
  });

  const new_data = await Promise.all(
    enrollmentRequests.map(async (item) => {
      return {
        ...item,
        isUserCreated: (await prisma.users.findFirst({
          where: {
            OR: [{ email: item.preferredEmail }, { email: item.altEmail }],
          },
        }))
          ? true
          : false,
      };
    })
  );

  const total = await prisma.enrollment_request.count({
    where: {
      id: id,
      enrollmentStatus: status,
    },
  });

  const retval = {
    data: new_data,
    total: total,
    page: page,
    limit: limit,
  };

  res.status(200).json({ ...retval, error: false });
};


// Track enrollment by ID and/or email - for public enrollment tracking
const trackEnrollment = async (req, res) => {
  const { enrollmentId, email } = req.body;

  try {
    // Validate that at least one parameter is provided
    if (!enrollmentId && !email) {
      return res.status(400).json({
        message: 'Please provide either enrollment ID or email',
        error: true
      });
    }

    // Build the where clause based on provided parameters
    let whereClause = {};
    if (enrollmentId && email) {
      // Both provided - must match both
      whereClause = {
        AND: [
          { enrollmentId: enrollmentId },
          {
            OR: [
              { preferredEmail: email },
              { altEmail: email }
            ]
          }
        ]
      };
    } else if (enrollmentId) {
      // Only enrollment ID provided
      whereClause = { enrollmentId: enrollmentId };
    } else if (email) {
      // Only email provided
      whereClause = {
        OR: [
          { preferredEmail: email },
          { altEmail: email }
        ]
      };
    }

    const enrollmentRequest = await prisma.enrollment_request.findFirst({
      where: whereClause,
    });

    if (!enrollmentRequest) {
      return res.status(404).json({
        message: 'Enrollment request not found. Please check your enrollment ID or email.',
        error: true
      });
    }

    const course = await prisma.course.findFirst({
      where: {
        name: enrollmentRequest.coursesToEnroll
      },
      select: {
        id: true,
        name: true,
        price: true
      }
    });

    // Map enrollment status to progress steps
    let currentStep = 1;
    let completedSteps = [];
    let remarkMsg = 'Your enrollment form has been submitted and is pending verification by an administrator.';

    const coursePrice = course ? parseFloat(course.price) : null;
    console.log('Enrollment request data:', {
      courseTablePrice: course?.price,
      finalCoursePrice: coursePrice,
      courseName: enrollmentRequest.coursesToEnroll,
      foundCourse: course
    });

    const priceText = coursePrice ? ` Course fee: ₱${coursePrice}.` : '';

    switch (enrollmentRequest.enrollmentStatus.toUpperCase()) {
      case 'PENDING':
        currentStep = 2;
        completedSteps = [1];
        remarkMsg = `Your enrollment form has been submitted and is pending verification by an administrator.${priceText}`;
        break;
      case 'VERIFIED':
        currentStep = 3;
        completedSteps = [1, 2];
        remarkMsg = `Your form has been verified by the administrator. Please proceed to payment.${priceText}`;
        break;
      case 'PAYMENT_PENDING':
        currentStep = 4;
        completedSteps = [1, 2, 3];
        remarkMsg = `Your payment is being verified. This may take 1-2 business days.${priceText}`;
        break;
      case 'APPROVED':
        currentStep = 5;
        completedSteps = [1, 2, 3, 4];
        remarkMsg = `Congratulations! Your enrollment has been approved.${priceText}`;
        break;
      case 'COMPLETED':
        currentStep = 5;
        completedSteps = [1, 2, 3, 4, 5];
        remarkMsg = `Congratulations! Your enrollment is complete.${priceText}`;
        break;
      case 'REJECTED':
        currentStep = 1;
        completedSteps = [];
        remarkMsg = 'Your enrollment request has been rejected. Please contact our admissions office for more information.';
        break;
      default:
        currentStep = 1;
        completedSteps = [];
        remarkMsg = 'Your enrollment form has been submitted and is pending verification by an administrator.';
    }

    // Return enrollment tracking data
    res.status(200).json({
      message: 'Enrollment found successfully',
      error: false,
      data: {
        enrollmentId: enrollmentRequest.enrollmentId,
        status: enrollmentRequest.enrollmentStatus,
        currentStep,
        completedSteps,
        remarkMsg,
        fullName: `${enrollmentRequest.firstName} ${enrollmentRequest.middleName || ''} ${enrollmentRequest.lastName}`.trim(),
        email: enrollmentRequest.preferredEmail,
        createdAt: enrollmentRequest.createdAt,
        coursesToEnroll: enrollmentRequest.coursesToEnroll,
        coursePrice: coursePrice,
        courseName: course?.name || enrollmentRequest.coursesToEnroll,
        paymentProofPath: enrollmentRequest.paymentProofPath
      }
    });

  } catch (error) {
    console.error('Error tracking enrollment:', error);
    res.status(500).json({
      message: 'An error occurred while tracking your enrollment',
      error: true
    });
  }
};

// Update enrollment request with payment proof
const updateEnrollmentPaymentProof = async (req, res) => {
  try {
    const { enrollmentId, paymentProofPath } = req.body;

    if (!enrollmentId || !paymentProofPath) {
      return res.status(400).json({
        message: 'Enrollment ID and payment proof path are required',
        error: true
      });
    }

    const updatedEnrollment = await prisma.enrollment_request.update({
      where: { enrollmentId },
      data: {
        paymentProofPath,
        enrollmentStatus: 'PAYMENT_PENDING'
      }
    });

    res.status(200).json({
      message: 'Payment proof uploaded successfully',
      error: false,
      data: updatedEnrollment
    });

  } catch (error) {
    console.error('Error updating payment proof:', error);

    if (error.code === 'P2025') {
      return res.status(404).json({
        message: 'Enrollment request not found',
        error: true
      });
    }

    res.status(500).json({
      message: 'An error occurred while updating payment proof',
      error: true
    });
  }
};

// Update enrollment status - for admin use
const updateEnrollmentStatus = async (req, res) => {
  const { enrollmentId } = req.params;
  const { enrollmentStatus } = req.body;

  try {
    const updated = await prisma.enrollment_request.update({
      where: { enrollmentId },
      data: { enrollmentStatus },
    });

    res.status(200).json({
      message: 'Enrollment status updated successfully',
      data: updated,
      error: false,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to update enrollment status',
      error: true,
    });
  }
};

export { createEnrollmentRequest, getEnrollmentRequests, trackEnrollment, updateEnrollmentPaymentProof, updateEnrollmentStatus };
