import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Report 1: Student Enrollment Report
const getStudentEnrollmentReport = async (req, res) => {
  try {
    const { periodId, studentEnrollmentStatus, accountStatus } = req.query;
    // Handle courseIds as array (can be sent multiple times in query string)
    const courseIds = req.query.courseIds
      ? Array.isArray(req.query.courseIds)
        ? req.query.courseIds
        : [req.query.courseIds]
      : [];

    let whereClause = {
      role: 'student',
      deletedAt: null,
    };

    // Simple binary check: enrolled or not enrolled
    if (studentEnrollmentStatus === 'enrolled') {
      // Student has at least one enrollment
      whereClause.enrollments = {
        some: {
          deletedAt: null,
          ...(periodId && { periodId: periodId }),
        },
      };
    } else if (studentEnrollmentStatus === 'not_enrolled') {
      // Student has no enrollments
      whereClause.enrollments = {
        none: {
          deletedAt: null,
          ...(periodId && { periodId: periodId }),
        },
      };
    }

    const schedules = await prisma.schedule.findMany({
      where: {
        ...(periodId && { periodId: periodId }),
        ...(courseIds.length > 0 && { courseId: { in: courseIds } }),
        deletedAt: null,
      },
      select: {
        id: true,
        course: {
          select: {
            id: true,
            name: true,
          },
        },
        period: {
          select: {
            id: true,
            batchName: true,
          },
        },
      },
    });

    const userSchedules = await prisma.user_schedule.findMany({
      where: {
        scheduleId: { in: schedules.map((schedule) => schedule.id) },
        deletedAt: null,
        user: {
          deletedAt: null,
          role: 'student',
          ...(!accountStatus || accountStatus === 'all'
            ? { status: true }
            : { status: accountStatus }),
        },
      },
      select: {
        scheduleId: true,
        schedule: {
          select: {
            course: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        user: {
          select: {
            userId: true,
            firstName: true,
            middleName: true,
            lastName: true,
            email: true,
            status: true,
          },
        },
      },
    });

    console.log(
      'yserschscules ko data',
      JSON.stringify(userSchedules, null, 2)
    );

    // Also get enrollment requests separately
    const enrollmentRequests = await prisma.enrollment_request.findMany({
      where: {
        ...(periodId && { id: periodId }),
      },
      select: {
        id: true,
        enrollmentId: true,
        enrollmentStatus: true,
        studentId: true,
        firstName: true,
        lastName: true,
        coursesToEnroll: true,
        createdAt: true,
      },
    });

    // Map enrollment requests by studentId for easy lookup
    const enrollmentRequestsByStudent = {};
    enrollmentRequests.forEach((req) => {
      if (req.studentId) {
        if (!enrollmentRequestsByStudent[req.studentId]) {
          enrollmentRequestsByStudent[req.studentId] = [];
        }
        enrollmentRequestsByStudent[req.studentId].push(req);
      }
    });

    // Get unique students (remove duplicates)
    const uniqueStudentsMap = new Map();
    userSchedules.forEach((us) => {
      if (!uniqueStudentsMap.has(us.user.userId)) {
        uniqueStudentsMap.set(us.user.userId, us.user);
      }
    });
    const students = Array.from(uniqueStudentsMap.values());

    const reportData = students.map((student) => ({
      studentId: student.userId,
      fullName: `${student.firstName}${
        student.middleName ? ' ' + student.middleName : ''
      } ${student.lastName}`,
      email: student.email,
      enrolled_courses: userSchedules
        .filter((us) => us.user.userId === student.userId)
        .map((us) => ({
          courseId: us.schedule.course.id,
          courseName: us.schedule.course.name,
        })),
    }));

    res.json({
      error: false,
      reportName: 'Student Enrollment Report',
      generatedAt: new Date(),
      totalRecords: reportData.length,
      filters: {
        periodId,
        courseIds,
        studentEnrollmentStatus,
        accountStatus,
      },
      data: reportData,
    });
  } catch (error) {
    console.error('Error generating student enrollment report:', error);
    res.status(500).json({
      error: true,
      message: 'Error generating report',
      details: error.message,
    });
  }
};

// Report 2: Financial Assessment Summary
const getFinancialAssessmentReport = async (req, res) => {
  try {
    const { periodId, status, minBalance, maxBalance } = req.query;

    let whereClause = {
      deletedAt: null,
    };

    if (periodId) whereClause.periodId = periodId;
    if (status) whereClause.status = status;

    const assessments = await prisma.assessment.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            userId: true,
            firstName: true,
            middleName: true,
            lastName: true,
            email: true,
          },
        },
        academicPeriod: {
          select: {
            name: true,
            schoolYear: true,
          },
        },
        ledger: {
          where: {
            deletedAt: null,
          },
          select: {
            paymentAmount: true,
            balance: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    let reportData = assessments.map((assessment) => {
      const totalPaid = assessment.ledger.reduce(
        (sum, l) => sum + (parseFloat(l.paymentAmount) || 0),
        0
      );
      const currentBalance = assessment.ledger[0]?.balance || assessment.amount;

      return {
        studentId: assessment.user?.userId,
        fullName: `${assessment.user?.firstName}${
          assessment.user?.middleName ? ' ' + assessment.user?.middleName : ''
        } ${assessment.user?.lastName}`,
        email: assessment.user?.email,
        academicPeriod: assessment.academicPeriod?.name,
        schoolYear: assessment.academicPeriod?.schoolYear,
        totalAssessment: parseFloat(assessment.amount),
        totalPaid: totalPaid,
        balance: parseFloat(currentBalance),
        status: assessment.status,
        assessmentDate: assessment.createdAt,
      };
    });

    // Filter by balance range if provided
    if (minBalance) {
      reportData = reportData.filter(
        (item) => item.balance >= parseFloat(minBalance)
      );
    }
    if (maxBalance) {
      reportData = reportData.filter(
        (item) => item.balance <= parseFloat(maxBalance)
      );
    }

    const totalAssessments = reportData.reduce(
      (sum, item) => sum + item.totalAssessment,
      0
    );
    const totalPaid = reportData.reduce((sum, item) => sum + item.totalPaid, 0);
    const totalBalance = reportData.reduce(
      (sum, item) => sum + item.balance,
      0
    );

    res.json({
      error: false,
      reportName: 'Financial Assessment Summary',
      generatedAt: new Date(),
      totalRecords: reportData.length,
      summary: {
        totalAssessments,
        totalPaid,
        totalBalance,
      },
      filters: { periodId, status, minBalance, maxBalance },
      data: reportData,
    });
  } catch (error) {
    console.error('Error generating financial assessment report:', error);
    res.status(500).json({
      error: true,
      message: 'Error generating report',
      details: error.message,
    });
  }
};

// Report 3: Grade Distribution Report
const getGradeDistributionReport = async (req, res) => {
  try {
    const { periodId, courseId, gradeRange } = req.query;

    let whereClause = {
      deletedAt: null,
      grade: { not: null },
    };

    if (periodId) {
      whereClause.schedule = {
        periodId: periodId,
        deletedAt: null,
      };
    }

    if (courseId) {
      whereClause.schedule = {
        ...whereClause.schedule,
        courseId: courseId,
      };
    }

    const grades = await prisma.user_schedule.findMany({
      where: whereClause,
      select: {
        grade: true,
        remarks: true,
        user: {
          select: {
            userId: true,
            firstName: true,
            middleName: true,
            lastName: true,
          },
        },
        schedule: {
          select: {
            course: {
              select: {
                courseCode: true,
                courseName: true,
                yearLevel: true,
              },
            },
            academicPeriod: {
              select: {
                name: true,
                schoolYear: true,
              },
            },
          },
        },
      },
    });

    // Calculate grade distribution
    const gradeDistribution = {};
    const gradeRanges = {
      '1.0-1.5': { min: 1.0, max: 1.5, count: 0 },
      '1.6-2.0': { min: 1.6, max: 2.0, count: 0 },
      '2.1-2.5': { min: 2.1, max: 2.5, count: 0 },
      '2.6-3.0': { min: 2.6, max: 3.0, count: 0 },
      '3.1-5.0': { min: 3.1, max: 5.0, count: 0 },
    };

    const reportData = grades.map((g) => {
      const gradeValue = parseFloat(g.grade);

      // Count for distribution
      for (const [range, { min, max }] of Object.entries(gradeRanges)) {
        if (gradeValue >= min && gradeValue <= max) {
          gradeRanges[range].count++;
          break;
        }
      }

      return {
        studentId: g.user?.userId,
        fullName: `${g.user?.firstName}${
          g.user?.middleName ? ' ' + g.user?.middleName : ''
        } ${g.user?.lastName}`,
        courseCode: g.schedule?.course?.courseCode,
        courseName: g.schedule?.course?.courseName,
        yearLevel: g.schedule?.course?.yearLevel,
        academicPeriod: g.schedule?.academicPeriod?.name,
        schoolYear: g.schedule?.academicPeriod?.schoolYear,
        grade: gradeValue,
        remarks: g.remarks,
      };
    });

    res.json({
      error: false,
      reportName: 'Grade Distribution Report',
      generatedAt: new Date(),
      totalRecords: reportData.length,
      distribution: gradeRanges,
      filters: { periodId, courseId, gradeRange },
      data: reportData,
    });
  } catch (error) {
    console.error('Error generating grade distribution report:', error);
    res.status(500).json({
      error: true,
      message: 'Error generating report',
      details: error.message,
    });
  }
};

// Report 4: Course Enrollment Statistics
const getCourseEnrollmentStatistics = async (req, res) => {
  try {
    const { periodId, courseId } = req.query;

    let whereClause = {
      deletedAt: null,
    };

    if (periodId) whereClause.periodId = periodId;
    if (courseId) whereClause.courseId = courseId;

    const schedules = await prisma.schedule.groupBy({
      by: ['id'],
      where: whereClause,
      _count: {
        select: { enrollments: true },
      },
      select: {
        course: {
          select: {
            id: true,
            name: true,
          },
        },
        period: {
          select: {
            id: true,
            batchName: true,
            schoolYear: true,
          },
        },
        user_schedule: {
          where: {
            deletedAt: null,
          },
        },
      },

      orderBy: {
        courseId: 'asc',
      },
    });

    const reportData = schedules.map((schedule) => ({
      section: schedule.section,
      academicPeriod: schedule.academicPeriod?.name,
      schoolYear: schedule.academicPeriod?.schoolYear,
      enrolledStudents: schedule.user_schedule.length,
      capacity: schedule.capacity || 'N/A',
      occupancyRate: schedule.capacity
        ? `${(
            (schedule.user_schedule.length / schedule.capacity) *
            100
          ).toFixed(2)}%`
        : 'N/A',
      days: schedule.days,
      timeStart: schedule.time_start,
      timeEnd: schedule.time_end,
    }));

    const totalEnrolled = reportData.reduce(
      (sum, item) => sum + item.enrolledStudents,
      0
    );

    res.json({
      error: false,
      reportName: 'Course Enrollment Statistics',
      generatedAt: new Date(),
      totalRecords: reportData.length,
      summary: {
        totalSections: reportData.length,
        totalEnrolledStudents: totalEnrolled,
        averageEnrollmentPerSection: (
          totalEnrolled / reportData.length || 0
        ).toFixed(2),
      },
      filters: { periodId, courseId },
      data: reportData,
    });
  } catch (error) {
    console.error('Error generating course enrollment statistics:', error);
    res.status(500).json({
      error: true,
      message: 'Error generating report',
      details: error.message,
    });
  }
};

// Report 5: Transaction History Report
const getTransactionHistoryReport = async (req, res) => {
  try {
    const { periodId, startDate, endDate, minAmount, maxAmount } = req.query;

    let whereClause = {
      deletedAt: null,
    };

    if (periodId) whereClause.periodId = periodId;

    if (startDate && endDate) {
      whereClause.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const transactions = await prisma.ledger.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            userId: true,
            firstName: true,
            middleName: true,
            lastName: true,
            email: true,
          },
        },
        academicPeriod: {
          select: {
            name: true,
            schoolYear: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    let reportData = transactions.map((transaction) => ({
      transactionId: transaction.id,
      studentId: transaction.user?.userId,
      fullName: `${transaction.user?.firstName}${
        transaction.user?.middleName ? ' ' + transaction.user?.middleName : ''
      } ${transaction.user?.lastName}`,
      email: transaction.user?.email,
      academicPeriod: transaction.academicPeriod?.name,
      schoolYear: transaction.academicPeriod?.schoolYear,
      paymentAmount: parseFloat(transaction.paymentAmount || 0),
      previousBalance: parseFloat(transaction.previousBalance || 0),
      balance: parseFloat(transaction.balance),
      transactionDate: transaction.createdAt,
      paymentMethod: transaction.paymentMethod || 'N/A',
      referenceNumber: transaction.referenceNumber || 'N/A',
    }));

    // Filter by amount range if provided
    if (minAmount) {
      reportData = reportData.filter(
        (item) => item.paymentAmount >= parseFloat(minAmount)
      );
    }
    if (maxAmount) {
      reportData = reportData.filter(
        (item) => item.paymentAmount <= parseFloat(maxAmount)
      );
    }

    const totalAmount = reportData.reduce(
      (sum, item) => sum + item.paymentAmount,
      0
    );

    res.json({
      error: false,
      reportName: 'Transaction History Report',
      generatedAt: new Date(),
      totalRecords: reportData.length,
      summary: {
        totalTransactions: reportData.length,
        totalAmount: totalAmount,
      },
      filters: { periodId, startDate, endDate, minAmount, maxAmount },
      data: reportData,
    });
  } catch (error) {
    console.error('Error generating transaction history report:', error);
    res.status(500).json({
      error: true,
      message: 'Error generating report',
      details: error.message,
    });
  }
};

// Report 6: Faculty Teaching Load Report
const getFacultyTeachingLoadReport = async (req, res) => {
  try {
    const { periodId, facultyId } = req.query;

    let whereClause = {
      deletedAt: null,
      teacher: { not: null },
    };

    if (periodId) whereClause.periodId = periodId;
    if (facultyId) whereClause.teacher = facultyId;

    const schedules = await prisma.schedule.findMany({
      where: whereClause,
      include: {
        course: {
          select: {
            courseCode: true,
            courseName: true,
            units: true,
            yearLevel: true,
          },
        },
        academicPeriod: {
          select: {
            name: true,
            schoolYear: true,
          },
        },
        teacherUser: {
          select: {
            userId: true,
            firstName: true,
            middleName: true,
            lastName: true,
            email: true,
          },
        },
        user_schedule: {
          where: {
            deletedAt: null,
          },
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        teacher: 'asc',
      },
    });

    // Group by teacher
    const teacherLoads = {};
    schedules.forEach((schedule) => {
      const teacherId = schedule.teacher;
      if (!teacherLoads[teacherId]) {
        teacherLoads[teacherId] = {
          teacherId: schedule.teacherUser?.userId,
          fullName: `${schedule.teacherUser?.firstName}${
            schedule.teacherUser?.middleName
              ? ' ' + schedule.teacherUser?.middleName
              : ''
          } ${schedule.teacherUser?.lastName}`,
          email: schedule.teacherUser?.email,
          totalUnits: 0,
          totalCourses: 0,
          totalStudents: 0,
          courses: [],
        };
      }

      teacherLoads[teacherId].totalUnits += schedule.course?.units || 0;
      teacherLoads[teacherId].totalCourses += 1;
      teacherLoads[teacherId].totalStudents += schedule.user_schedule.length;
      teacherLoads[teacherId].courses.push({
        courseCode: schedule.course?.courseCode,
        courseName: schedule.course?.courseName,
        section: schedule.section,
        units: schedule.course?.units,
        yearLevel: schedule.course?.yearLevel,
        enrolledStudents: schedule.user_schedule.length,
        days: schedule.days,
        timeStart: schedule.time_start,
        timeEnd: schedule.time_end,
        academicPeriod: schedule.academicPeriod?.name,
        schoolYear: schedule.academicPeriod?.schoolYear,
      });
    });

    const reportData = Object.values(teacherLoads);

    res.json({
      error: false,
      reportName: 'Faculty Teaching Load Report',
      generatedAt: new Date(),
      totalRecords: reportData.length,
      filters: { periodId, facultyId },
      data: reportData,
    });
  } catch (error) {
    console.error('Error generating faculty teaching load report:', error);
    res.status(500).json({
      error: true,
      message: 'Error generating report',
      details: error.message,
    });
  }
};

// Report 7: Student Academic Progress
const getStudentAcademicProgressReport = async (req, res) => {
  try {
    const { studentId, periodId } = req.query;

    let userWhereClause = {
      role: 'student',
      deletedAt: null,
    };

    if (studentId) userWhereClause.userId = studentId;

    const students = await prisma.users.findMany({
      where: userWhereClause,
      select: {
        userId: true,
        firstName: true,
        middleName: true,
        lastName: true,
        email: true,
        user_schedule: {
          where: {
            deletedAt: null,
            ...(periodId && {
              schedule: {
                periodId: periodId,
                deletedAt: null,
              },
            }),
          },
          include: {
            schedule: {
              include: {
                course: {
                  select: {
                    courseCode: true,
                    courseName: true,
                    units: true,
                    yearLevel: true,
                  },
                },
                academicPeriod: {
                  select: {
                    name: true,
                    schoolYear: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const reportData = students.map((student) => {
      const completedCourses = student.user_schedule.filter(
        (us) => us.grade && parseFloat(us.grade) <= 3.0
      );
      const totalUnits = completedCourses.reduce(
        (sum, us) => sum + (us.schedule?.course?.units || 0),
        0
      );
      const grades = completedCourses
        .map((us) => parseFloat(us.grade))
        .filter((g) => !isNaN(g));
      const gpa =
        grades.length > 0
          ? (grades.reduce((sum, g) => sum + g, 0) / grades.length).toFixed(2)
          : 'N/A';

      return {
        studentId: student.userId,
        fullName: `${student.firstName}${
          student.middleName ? ' ' + student.middleName : ''
        } ${student.lastName}`,
        email: student.email,
        totalCoursesEnrolled: student.user_schedule.length,
        completedCourses: completedCourses.length,
        totalUnitsCompleted: totalUnits,
        gpa: gpa,
        courses: student.user_schedule.map((us) => ({
          courseCode: us.schedule?.course?.courseCode,
          courseName: us.schedule?.course?.courseName,
          units: us.schedule?.course?.units,
          yearLevel: us.schedule?.course?.yearLevel,
          academicPeriod: us.schedule?.academicPeriod?.name,
          schoolYear: us.schedule?.academicPeriod?.schoolYear,
          grade: us.grade || 'In Progress',
          remarks: us.remarks || 'Ongoing',
        })),
      };
    });

    res.json({
      error: false,
      reportName: 'Student Academic Progress Report',
      generatedAt: new Date(),
      totalRecords: reportData.length,
      filters: { studentId, periodId },
      data: reportData,
    });
  } catch (error) {
    console.error('Error generating student academic progress report:', error);
    res.status(500).json({
      error: true,
      message: 'Error generating report',
      details: error.message,
    });
  }
};

// Report 8: Enrollment Period Analysis
const getEnrollmentPeriodAnalysis = async (req, res) => {
  try {
    const { schoolYear } = req.query;

    let whereClause = {
      deletedAt: null,
    };

    if (schoolYear) whereClause.schoolYear = schoolYear;

    const periods = await prisma.academic_period.findMany({
      where: whereClause,
      include: {
        schedule: {
          where: {
            deletedAt: null,
          },
          include: {
            user_schedule: {
              where: {
                deletedAt: null,
              },
              select: {
                id: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const reportData = periods.map((period) => {
      const totalSections = period.schedule.length;
      const totalEnrollments = period.schedule.reduce(
        (sum, s) => sum + s.user_schedule.length,
        0
      );

      return {
        periodId: period.id,
        periodName: period.name,
        schoolYear: period.schoolYear,
        startDate: period.startDate,
        endDate: period.endDate,
        status: period.status,
        totalSections: totalSections,
        totalEnrollments: totalEnrollments,
        averageEnrollmentPerSection:
          totalSections > 0 ? (totalEnrollments / totalSections).toFixed(2) : 0,
        createdAt: period.createdAt,
      };
    });

    res.json({
      error: false,
      reportName: 'Enrollment Period Analysis',
      generatedAt: new Date(),
      totalRecords: reportData.length,
      filters: { schoolYear },
      data: reportData,
    });
  } catch (error) {
    console.error('Error generating enrollment period analysis:', error);
    res.status(500).json({
      error: true,
      message: 'Error generating report',
      details: error.message,
    });
  }
};

// Report 9: Outstanding Balance Report
const getOutstandingBalanceReport = async (req, res) => {
  try {
    const { periodId, minBalance = 0.01 } = req.query;

    let whereClause = {
      deletedAt: null,
    };

    if (periodId) whereClause.periodId = periodId;

    // Get all ledgers and find the latest for each user
    const ledgers = await prisma.ledger.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            userId: true,
            firstName: true,
            middleName: true,
            lastName: true,
            email: true,
          },
        },
        academicPeriod: {
          select: {
            name: true,
            schoolYear: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Group by user and get latest balance
    const userBalances = {};
    ledgers.forEach((ledger) => {
      if (!userBalances[ledger.userId]) {
        userBalances[ledger.userId] = {
          studentId: ledger.user?.userId,
          fullName: `${ledger.user?.firstName}${
            ledger.user?.middleName ? ' ' + ledger.user?.middleName : ''
          } ${ledger.user?.lastName}`,
          email: ledger.user?.email,
          academicPeriod: ledger.academicPeriod?.name,
          schoolYear: ledger.academicPeriod?.schoolYear,
          balance: parseFloat(ledger.balance),
          lastPaymentDate: ledger.createdAt,
          lastPaymentAmount: parseFloat(ledger.paymentAmount || 0),
        };
      }
    });

    // Filter by minimum balance and sort by balance descending
    let reportData = Object.values(userBalances)
      .filter((item) => item.balance >= parseFloat(minBalance))
      .sort((a, b) => b.balance - a.balance);

    // Calculate aging
    reportData = reportData.map((item) => {
      const daysSinceLastPayment = Math.floor(
        (new Date() - new Date(item.lastPaymentDate)) / (1000 * 60 * 60 * 24)
      );
      let agingCategory = 'Current';
      if (daysSinceLastPayment > 90) agingCategory = '90+ days';
      else if (daysSinceLastPayment > 60) agingCategory = '60-90 days';
      else if (daysSinceLastPayment > 30) agingCategory = '30-60 days';

      return {
        ...item,
        daysSinceLastPayment,
        agingCategory,
      };
    });

    const totalOutstanding = reportData.reduce(
      (sum, item) => sum + item.balance,
      0
    );

    res.json({
      error: false,
      reportName: 'Outstanding Balance Report',
      generatedAt: new Date(),
      totalRecords: reportData.length,
      summary: {
        totalOutstandingBalance: totalOutstanding,
      },
      filters: { periodId, minBalance },
      data: reportData,
    });
  } catch (error) {
    console.error('Error generating outstanding balance report:', error);
    res.status(500).json({
      error: true,
      message: 'Error generating report',
      details: error.message,
    });
  }
};

// Report 10: Document Submission Status
const getDocumentSubmissionStatus = async (req, res) => {
  try {
    const { status, studentId } = req.query;

    let whereClause = {
      deletedAt: null,
    };

    if (status) whereClause.status = status;
    if (studentId)
      whereClause.user = {
        userId: studentId,
      };

    const documents = await prisma.document.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            userId: true,
            firstName: true,
            middleName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const reportData = documents.map((doc) => ({
      documentId: doc.id,
      studentId: doc.user?.userId,
      fullName: `${doc.user?.firstName}${
        doc.user?.middleName ? ' ' + doc.user?.middleName : ''
      } ${doc.user?.lastName}`,
      email: doc.user?.email,
      documentType: doc.type,
      documentName: doc.name,
      status: doc.status,
      submittedDate: doc.createdAt,
      validatedDate: doc.validatedAt,
      remarks: doc.remarks || 'N/A',
    }));

    // Count by status
    const statusCounts = reportData.reduce((acc, doc) => {
      acc[doc.status] = (acc[doc.status] || 0) + 1;
      return acc;
    }, {});

    res.json({
      error: false,
      reportName: 'Document Submission Status Report',
      generatedAt: new Date(),
      totalRecords: reportData.length,
      summary: {
        statusBreakdown: statusCounts,
      },
      filters: { status, studentId },
      data: reportData,
    });
  } catch (error) {
    console.error('Error generating document submission status report:', error);
    res.status(500).json({
      error: true,
      message: 'Error generating report',
      details: error.message,
    });
  }
};

// Report 11: Class Schedule Report
const getClassScheduleReport = async (req, res) => {
  try {
    const { periodId, courseId, days } = req.query;

    let whereClause = {
      deletedAt: null,
    };

    if (periodId) whereClause.periodId = periodId;
    if (courseId) whereClause.courseId = courseId;
    if (days) whereClause.days = { contains: days };

    const schedules = await prisma.schedule.findMany({
      where: whereClause,
      include: {
        course: {
          select: {
            courseCode: true,
            courseName: true,
            units: true,
            yearLevel: true,
          },
        },
        academicPeriod: {
          select: {
            name: true,
            schoolYear: true,
          },
        },
        teacherUser: {
          select: {
            userId: true,
            firstName: true,
            middleName: true,
            lastName: true,
          },
        },
        user_schedule: {
          where: {
            deletedAt: null,
          },
          select: {
            id: true,
          },
        },
      },
      orderBy: [{ days: 'asc' }, { time_start: 'asc' }],
    });

    const reportData = schedules.map((schedule) => ({
      scheduleId: schedule.id,
      courseCode: schedule.course?.courseCode,
      courseName: schedule.course?.courseName,
      section: schedule.section,
      yearLevel: schedule.course?.yearLevel,
      units: schedule.course?.units,
      academicPeriod: schedule.academicPeriod?.name,
      schoolYear: schedule.academicPeriod?.schoolYear,
      instructor: schedule.teacherUser
        ? `${schedule.teacherUser.firstName}${
            schedule.teacherUser.middleName
              ? ' ' + schedule.teacherUser.middleName
              : ''
          } ${schedule.teacherUser.lastName}`
        : 'TBA',
      instructorId: schedule.teacherUser?.userId,
      days: schedule.days,
      timeStart: schedule.time_start,
      timeEnd: schedule.time_end,
      room: schedule.room || 'TBA',
      enrolledStudents: schedule.user_schedule.length,
      capacity: schedule.capacity || 'N/A',
    }));

    res.json({
      error: false,
      reportName: 'Class Schedule Report',
      generatedAt: new Date(),
      totalRecords: reportData.length,
      filters: { periodId, courseId, days },
      data: reportData,
    });
  } catch (error) {
    console.error('Error generating class schedule report:', error);
    res.status(500).json({
      error: true,
      message: 'Error generating report',
      details: error.message,
    });
  }
};

// Report 12: Student Ledger Summary
const getStudentLedgerSummary = async (req, res) => {
  try {
    const { studentId, periodId } = req.query;

    if (!studentId) {
      return res.status(400).json({
        error: true,
        message: 'studentId is required for this report',
      });
    }

    let whereClause = {
      deletedAt: null,
      user: {
        userId: studentId,
      },
    };

    if (periodId) whereClause.periodId = periodId;

    const ledgers = await prisma.ledger.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            userId: true,
            firstName: true,
            middleName: true,
            lastName: true,
            email: true,
          },
        },
        academicPeriod: {
          select: {
            name: true,
            schoolYear: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    if (ledgers.length === 0) {
      return res.json({
        error: false,
        reportName: 'Student Ledger Summary',
        generatedAt: new Date(),
        message: 'No ledger entries found for this student',
        filters: { studentId, periodId },
        data: [],
      });
    }

    const student = ledgers[0].user;
    const totalPayments = ledgers.reduce(
      (sum, l) => sum + parseFloat(l.paymentAmount || 0),
      0
    );
    const currentBalance = parseFloat(ledgers[ledgers.length - 1].balance);

    const reportData = {
      studentId: student.userId,
      fullName: `${student.firstName}${
        student.middleName ? ' ' + student.middleName : ''
      } ${student.lastName}`,
      email: student.email,
      summary: {
        totalPayments,
        currentBalance,
        totalTransactions: ledgers.length,
      },
      transactions: ledgers.map((ledger) => ({
        transactionId: ledger.id,
        date: ledger.createdAt,
        academicPeriod: ledger.academicPeriod?.name,
        schoolYear: ledger.academicPeriod?.schoolYear,
        paymentAmount: parseFloat(ledger.paymentAmount || 0),
        previousBalance: parseFloat(ledger.previousBalance || 0),
        balance: parseFloat(ledger.balance),
        paymentMethod: ledger.paymentMethod || 'N/A',
        referenceNumber: ledger.referenceNumber || 'N/A',
      })),
    };

    res.json({
      error: false,
      reportName: 'Student Ledger Summary',
      generatedAt: new Date(),
      filters: { studentId, periodId },
      data: reportData,
    });
  } catch (error) {
    console.error('Error generating student ledger summary:', error);
    res.status(500).json({
      error: true,
      message: 'Error generating report',
      details: error.message,
    });
  }
};

// Report 13: Enrollment Requests Log
const getEnrollmentRequestsLog = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;

    let whereClause = {
      deletedAt: null,
    };

    if (status) whereClause.status = status;

    if (startDate && endDate) {
      whereClause.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const enrollments = await prisma.enrollment.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            userId: true,
            firstName: true,
            middleName: true,
            lastName: true,
            email: true,
          },
        },
        academicPeriod: {
          select: {
            name: true,
            schoolYear: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const reportData = enrollments.map((enrollment) => ({
      enrollmentId: enrollment.id,
      studentId: enrollment.user?.userId,
      fullName: `${enrollment.user?.firstName}${
        enrollment.user?.middleName ? ' ' + enrollment.user?.middleName : ''
      } ${enrollment.user?.lastName}`,
      email: enrollment.user?.email,
      academicPeriod: enrollment.academicPeriod?.name,
      schoolYear: enrollment.academicPeriod?.schoolYear,
      status: enrollment.status,
      requestDate: enrollment.createdAt,
      processedDate: enrollment.updatedAt,
      remarks: enrollment.remarks || 'N/A',
    }));

    // Count by status
    const statusCounts = reportData.reduce((acc, enr) => {
      acc[enr.status] = (acc[enr.status] || 0) + 1;
      return acc;
    }, {});

    res.json({
      error: false,
      reportName: 'Enrollment Requests Log',
      generatedAt: new Date(),
      totalRecords: reportData.length,
      summary: {
        statusBreakdown: statusCounts,
      },
      filters: { status, startDate, endDate },
      data: reportData,
    });
  } catch (error) {
    console.error('Error generating enrollment requests log:', error);
    res.status(500).json({
      error: true,
      message: 'Error generating report',
      details: error.message,
    });
  }
};

// Report 14: Fee Structure Report
const getFeeStructureReport = async (req, res) => {
  try {
    const { periodId, feeType } = req.query;

    let whereClause = {
      deletedAt: null,
    };

    if (periodId) whereClause.periodId = periodId;
    if (feeType) whereClause.feeType = feeType;

    const fees = await prisma.fee.findMany({
      where: whereClause,
      include: {
        academicPeriod: {
          select: {
            name: true,
            schoolYear: true,
          },
        },
      },
      orderBy: [{ feeType: 'asc' }, { amount: 'desc' }],
    });

    const reportData = fees.map((fee) => ({
      feeId: fee.id,
      feeName: fee.name,
      feeType: fee.feeType,
      amount: parseFloat(fee.amount),
      yearLevel: fee.yearLevel || 'All',
      program: fee.program || 'All',
      academicPeriod: fee.academicPeriod?.name,
      schoolYear: fee.academicPeriod?.schoolYear,
      description: fee.description || 'N/A',
      isRequired: fee.isRequired || false,
    }));

    // Group by fee type
    const feeTypeGroups = reportData.reduce((acc, fee) => {
      if (!acc[fee.feeType]) {
        acc[fee.feeType] = [];
      }
      acc[fee.feeType].push(fee);
      return acc;
    }, {});

    const totalFees = reportData.reduce((sum, fee) => sum + fee.amount, 0);

    res.json({
      error: false,
      reportName: 'Fee Structure Report',
      generatedAt: new Date(),
      totalRecords: reportData.length,
      summary: {
        totalFees,
        feeTypeBreakdown: Object.keys(feeTypeGroups).map((type) => ({
          type,
          count: feeTypeGroups[type].length,
          totalAmount: feeTypeGroups[type].reduce(
            (sum, f) => sum + f.amount,
            0
          ),
        })),
      },
      filters: { periodId, feeType },
      data: reportData,
    });
  } catch (error) {
    console.error('Error generating fee structure report:', error);
    res.status(500).json({
      error: true,
      message: 'Error generating report',
      details: error.message,
    });
  }
};

// Report 15: User Account Activity
const getUserAccountActivity = async (req, res) => {
  try {
    const { role, status, startDate, endDate } = req.query;

    let whereClause = {
      deletedAt: null,
    };

    if (role) whereClause.role = role;
    if (status) whereClause.status = status;

    if (startDate && endDate) {
      whereClause.updatedAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const users = await prisma.users.findMany({
      where: whereClause,
      select: {
        userId: true,
        firstName: true,
        middleName: true,
        lastName: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    const reportData = users.map((user) => ({
      userId: user.userId,
      fullName: `${user.firstName}${
        user.middleName ? ' ' + user.middleName : ''
      } ${user.lastName}`,
      email: user.email,
      role: user.role,
      status: user.status,
      accountCreated: user.createdAt,
      lastUpdated: user.updatedAt,
      accountAge: Math.floor(
        (new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)
      ),
    }));

    // Count by role and status
    const roleCounts = reportData.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});

    const statusCounts = reportData.reduce((acc, user) => {
      acc[user.status] = (acc[user.status] || 0) + 1;
      return acc;
    }, {});

    res.json({
      error: false,
      reportName: 'User Account Activity Report',
      generatedAt: new Date(),
      totalRecords: reportData.length,
      summary: {
        roleBreakdown: roleCounts,
        statusBreakdown: statusCounts,
      },
      filters: { role, status, startDate, endDate },
      data: reportData,
    });
  } catch (error) {
    console.error('Error generating user account activity report:', error);
    res.status(500).json({
      error: true,
      message: 'Error generating report',
      details: error.message,
    });
  }
};

// Report 16: Graduated Students Report
const getGraduatedStudentsReport = async (req, res) => {
  try {
    const { schoolYear, program } = req.query;

    // For now, we'll identify graduated students as those who have completed all courses
    // This is a simplified approach - adjust based on your actual graduation logic
    const students = await prisma.users.findMany({
      where: {
        role: 'student',
        status: 'active',
        deletedAt: null,
      },
      select: {
        userId: true,
        firstName: true,
        middleName: true,
        lastName: true,
        email: true,
        createdAt: true,
        user_schedule: {
          where: {
            deletedAt: null,
            grade: { not: null },
          },
          include: {
            schedule: {
              include: {
                course: {
                  select: {
                    courseCode: true,
                    courseName: true,
                    units: true,
                    yearLevel: true,
                  },
                },
                academicPeriod: {
                  select: {
                    name: true,
                    schoolYear: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Filter students who have completed courses (passed grades)
    let reportData = students
      .map((student) => {
        const completedCourses = student.user_schedule.filter(
          (us) => us.grade && parseFloat(us.grade) <= 3.0
        );

        if (completedCourses.length === 0) return null;

        const totalUnits = completedCourses.reduce(
          (sum, us) => sum + (us.schedule?.course?.units || 0),
          0
        );

        const grades = completedCourses
          .map((us) => parseFloat(us.grade))
          .filter((g) => !isNaN(g));
        const gpa =
          grades.length > 0
            ? (grades.reduce((sum, g) => sum + g, 0) / grades.length).toFixed(2)
            : 'N/A';

        // Get latest academic period from completed courses
        const latestCourse = completedCourses.sort(
          (a, b) =>
            new Date(b.schedule?.academicPeriod?.schoolYear) -
            new Date(a.schedule?.academicPeriod?.schoolYear)
        )[0];

        return {
          studentId: student.userId,
          fullName: `${student.firstName}${
            student.middleName ? ' ' + student.middleName : ''
          } ${student.lastName}`,
          email: student.email,
          enrollmentDate: student.createdAt,
          completedCourses: completedCourses.length,
          totalUnits: totalUnits,
          gpa: gpa,
          latestAcademicPeriod: latestCourse?.schedule?.academicPeriod?.name,
          latestSchoolYear: latestCourse?.schedule?.academicPeriod?.schoolYear,
        };
      })
      .filter(Boolean);

    // Filter by schoolYear and program if provided
    if (schoolYear) {
      reportData = reportData.filter(
        (item) => item.latestSchoolYear === schoolYear
      );
    }

    res.json({
      error: false,
      reportName: 'Graduated Students Report',
      generatedAt: new Date(),
      totalRecords: reportData.length,
      filters: { schoolYear, program },
      data: reportData,
    });
  } catch (error) {
    console.error('Error generating graduated students report:', error);
    res.status(500).json({
      error: true,
      message: 'Error generating report',
      details: error.message,
    });
  }
};

// Report 17: Archived Records Report
const getArchivedRecordsReport = async (req, res) => {
  try {
    const { recordType, schoolYear } = req.query;

    const reportData = {
      users: [],
      courses: [],
      schedules: [],
      enrollments: [],
    };

    if (!recordType || recordType === 'users') {
      const archivedUsers = await prisma.users.findMany({
        where: {
          deletedAt: { not: null },
        },
        select: {
          userId: true,
          firstName: true,
          middleName: true,
          lastName: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
          deletedAt: true,
        },
        orderBy: {
          deletedAt: 'desc',
        },
      });

      reportData.users = archivedUsers.map((user) => ({
        userId: user.userId,
        fullName: `${user.firstName}${
          user.middleName ? ' ' + user.middleName : ''
        } ${user.lastName}`,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        archivedAt: user.deletedAt,
      }));
    }

    if (!recordType || recordType === 'courses') {
      const archivedCourses = await prisma.course.findMany({
        where: {
          deletedAt: { not: null },
        },
        select: {
          courseCode: true,
          courseName: true,
          units: true,
          yearLevel: true,
          createdAt: true,
          deletedAt: true,
        },
        orderBy: {
          deletedAt: 'desc',
        },
      });

      reportData.courses = archivedCourses;
    }

    if (!recordType || recordType === 'schedules') {
      let whereClause = {
        deletedAt: { not: null },
      };

      if (schoolYear) {
        whereClause.academicPeriod = {
          schoolYear: schoolYear,
        };
      }

      const archivedSchedules = await prisma.schedule.findMany({
        where: whereClause,
        include: {
          course: {
            select: {
              courseCode: true,
              courseName: true,
            },
          },
          academicPeriod: {
            select: {
              name: true,
              schoolYear: true,
            },
          },
        },
        orderBy: {
          deletedAt: 'desc',
        },
      });

      reportData.schedules = archivedSchedules.map((schedule) => ({
        scheduleId: schedule.id,
        courseCode: schedule.course?.courseCode,
        courseName: schedule.course?.courseName,
        section: schedule.section,
        academicPeriod: schedule.academicPeriod?.name,
        schoolYear: schedule.academicPeriod?.schoolYear,
        archivedAt: schedule.deletedAt,
      }));
    }

    const totalRecords =
      reportData.users.length +
      reportData.courses.length +
      reportData.schedules.length +
      reportData.enrollments.length;

    res.json({
      error: false,
      reportName: 'Archived Records Report',
      generatedAt: new Date(),
      totalRecords: totalRecords,
      summary: {
        archivedUsers: reportData.users.length,
        archivedCourses: reportData.courses.length,
        archivedSchedules: reportData.schedules.length,
        archivedEnrollments: reportData.enrollments.length,
      },
      filters: { recordType, schoolYear },
      data: reportData,
    });
  } catch (error) {
    console.error('Error generating archived records report:', error);
    res.status(500).json({
      error: true,
      message: 'Error generating report',
      details: error.message,
    });
  }
};

// Report 18: Program Enrollment Trends
const getProgramEnrollmentTrends = async (req, res) => {
  try {
    const { startYear, endYear } = req.query;

    let whereClause = {
      deletedAt: null,
    };

    if (startYear && endYear) {
      whereClause.schoolYear = {
        gte: startYear,
        lte: endYear,
      };
    }

    const periods = await prisma.academic_period.findMany({
      where: whereClause,
      include: {
        schedule: {
          where: {
            deletedAt: null,
          },
          include: {
            course: {
              select: {
                courseCode: true,
                courseName: true,
                yearLevel: true,
              },
            },
            user_schedule: {
              where: {
                deletedAt: null,
              },
              select: {
                id: true,
              },
            },
          },
        },
      },
      orderBy: {
        schoolYear: 'asc',
      },
    });

    // Group enrollments by academic period and program/course
    const trendsData = periods.map((period) => {
      const programStats = {};

      period.schedule.forEach((schedule) => {
        const programKey =
          schedule.course?.courseCode?.substring(0, 3) || 'Unknown';

        if (!programStats[programKey]) {
          programStats[programKey] = {
            program: programKey,
            totalEnrollments: 0,
            courses: {},
          };
        }

        programStats[programKey].totalEnrollments +=
          schedule.user_schedule.length;

        const courseKey = schedule.course?.courseCode || 'Unknown';
        if (!programStats[programKey].courses[courseKey]) {
          programStats[programKey].courses[courseKey] = {
            courseCode: courseKey,
            courseName: schedule.course?.courseName,
            enrollments: 0,
          };
        }
        programStats[programKey].courses[courseKey].enrollments +=
          schedule.user_schedule.length;
      });

      return {
        academicPeriod: period.name,
        schoolYear: period.schoolYear,
        totalEnrollments: period.schedule.reduce(
          (sum, s) => sum + s.user_schedule.length,
          0
        ),
        programs: Object.values(programStats).map((prog) => ({
          ...prog,
          courses: Object.values(prog.courses),
        })),
      };
    });

    res.json({
      error: false,
      reportName: 'Program Enrollment Trends',
      generatedAt: new Date(),
      totalPeriods: trendsData.length,
      filters: { startYear, endYear },
      data: trendsData,
    });
  } catch (error) {
    console.error('Error generating program enrollment trends:', error);
    res.status(500).json({
      error: true,
      message: 'Error generating report',
      details: error.message,
    });
  }
};

export {
  getStudentEnrollmentReport,
  getFinancialAssessmentReport,
  getGradeDistributionReport,
  getCourseEnrollmentStatistics,
  getTransactionHistoryReport,
  getFacultyTeachingLoadReport,
  getStudentAcademicProgressReport,
  getEnrollmentPeriodAnalysis,
  getOutstandingBalanceReport,
  getDocumentSubmissionStatus,
  getClassScheduleReport,
  getStudentLedgerSummary,
  getEnrollmentRequestsLog,
  getFeeStructureReport,
  getUserAccountActivity,
  getGraduatedStudentsReport,
  getArchivedRecordsReport,
  getProgramEnrollmentTrends,
};
