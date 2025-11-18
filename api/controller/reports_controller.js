import pkg from "@prisma/client";
const { PrismaClient } = pkg;
const prisma = new PrismaClient();
import { convert24To12HourFormatLocale } from "../utils/format.js";
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

    // Build filters for schedule query
    let scheduleWhereClause = {
      deletedAt: null,
    };

    if (periodId) scheduleWhereClause.periodId = periodId;
    if (courseIds.length > 0) scheduleWhereClause.courseId = { in: courseIds };

    const schedules = await prisma.schedule.findMany({
      where: scheduleWhereClause,
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

    // Build user where clause for filtering students
    let userWhereClause = {
      role: "student",
    };

    // Apply account status filter (empty string or undefined means "All")
    if (accountStatus && accountStatus !== "" && accountStatus !== "All") {
      userWhereClause.status = accountStatus;
    }

    const userSchedules = await prisma.user_schedule.findMany({
      where: {
        scheduleId: { in: schedules.map((schedule) => schedule.id) },
        deletedAt: null,
        user: {
          is: userWhereClause,
        },
      },
      select: {
        scheduleId: true,
        schedule: {
          select: {
            id: true,
            days: true,
            time_start: true,
            time_end: true,
            location: true,
            teacherId: true,
            teacher: {
              select: {
                userId: true,
                firstName: true,
                middleName: true,
                lastName: true,
              },
            },
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
      "yserschscules ko data",
      JSON.stringify(userSchedules, null, 2)
    );

    // Also get enrollment requests separately (optional - for additional context)
    const enrollmentRequests = await prisma.enrollment_request.findMany({
      where: {
        ...(periodId && { periodId: periodId }),
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
      console.log("us ko before", us);
      if (!uniqueStudentsMap.has(us.user.userId)) {
        uniqueStudentsMap.set(us.user.userId, us.user);
      }
    });
    const students = Array.from(uniqueStudentsMap.values());

    const reportData = students.map((student) => ({
      studentId: student.userId,
      lastName: student.lastName,
      firstName: student.firstName,
      middleName: student.middleName,
      status: student.status,
      fullName: `${student.firstName}${
        student.middleName ? " " + student.middleName : ""
      } ${student.lastName}`,
      email: student.email,
      enrolled_courses: userSchedules
        .filter((us) => us.user.userId === student.userId)
        .map((us) => ({
          courseId: us.schedule.course.id,
          courseName: us.schedule.course.name,
          scheduleId: us.schedule.id,
          scheduleDays: us.schedule.days,
          scheduleTimeStart: convert24To12HourFormatLocale(
            us.schedule.time_start
          ),
          scheduleTimeEnd: convert24To12HourFormatLocale(us.schedule.time_end),
          scheduleLocation: us.schedule.location,
          scheduleTeacher: us.schedule.teacher
            ? `${us.schedule.teacher.firstName}${
                us.schedule.teacher.middleName
                  ? " " + us.schedule.teacher.middleName
                  : ""
              } ${us.schedule.teacher.lastName}`
            : "TBA",
          scheduleTeacherId: us.schedule.teacher?.userId || null,
        })),
    }));

    res.json({
      error: false,
      reportName: "Student Enrollment Report",
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
    console.error("Error generating student enrollment report:", error);
    res.status(500).json({
      error: true,
      message: "Error generating report",
      details: error.message,
    });
  }
};

// Report 2: Financial Assessment Summary
const getFinancialAssessmentReport = async (req, res) => {
  try {
    const { periodId } = req.query;

    if (!periodId) {
      return res.status(400).json({
        error: true,
        message: "Academic Period is required",
      });
    }

    // Get all enrolled students for this period with their schedules
    const userSchedules = await prisma.user_schedule.findMany({
      where: {
        deletedAt: null,
        schedule: {
          periodId: periodId,
          deletedAt: null,
        },
        user: {
          role: "student",
        },
      },
      include: {
        user: {
          select: {
            id: true,
            userId: true,
            firstName: true,
            middleName: true,
            lastName: true,
            email: true,
          },
        },
        schedule: {
          include: {
            course: {
              select: {
                id: true,
                name: true,
                price: true,
              },
            },
            period: {
              select: {
                id: true,
                batchName: true,
                startAt: true,
              },
            },
          },
        },
      },
    });

    // Group by student and calculate financials
    const studentFinancials = {};

    for (const us of userSchedules) {
      const studentId = us.user.id;

      if (!studentFinancials[studentId]) {
        studentFinancials[studentId] = {
          studentId: us.user.userId,
          fullName: `${us.user.firstName}${
            us.user.middleName ? " " + us.user.middleName : ""
          } ${us.user.lastName}`,
          email: us.user.email,
          academicPeriod: us.schedule.period?.batchName,
          academicYear: us.schedule.period?.startAt
            ? new Date(us.schedule.period.startAt).getFullYear()
            : null,
          courses: [],
          totalAssessment: 0,
          totalPaid: 0,
        };
      }

      // Get course fees
      const fees = await prisma.fees.findMany({
        where: {
          courseId: us.schedule.courseId,
          batchId: us.schedule.periodId,
          isActive: true,
        },
      });

      // Get student-specific fees
      const studentFees = await prisma.student_fee.findMany({
        where: {
          studentId: studentId,
          courseId: us.schedule.courseId,
          batchId: us.schedule.periodId,
          deletedAt: null,
        },
      });

      // Get payments
      const payments = await prisma.payments.findMany({
        where: {
          userId: studentId,
          status: "paid",
          courseId: us.schedule.courseId,
          academicPeriodId: us.schedule.periodId,
        },
      });

      // Get adjustments
      const adjustments = await prisma.adjustments.findMany({
        where: {
          userId: studentId,
        },
      });

      // Calculate course assessment
      const courseBasePrice = Number(us.schedule.course?.price || 0);
      const studentFeeTotal = studentFees.reduce((sum, sf) => {
        if (sf.type === "fee") return sum + Number(sf.amount);
        if (sf.type === "discount") return sum - Number(sf.amount);
        return sum;
      }, 0);

      const courseAssessment =
        fees.reduce((sum, f) => sum + Number(f.price), 0) +
        courseBasePrice +
        studentFeeTotal -
        adjustments.reduce((sum, a) => sum + Number(a.amount), 0);

      const coursePaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);

      studentFinancials[studentId].courses.push({
        courseName: us.schedule.course?.name,
        assessment: courseAssessment,
        paid: coursePaid,
      });

      studentFinancials[studentId].totalAssessment += courseAssessment;
      studentFinancials[studentId].totalPaid += coursePaid;
    }

    // Calculate balances and payment status
    const reportData = Object.values(studentFinancials).map((student) => ({
      ...student,
      balance: student.totalAssessment - student.totalPaid,
      paymentStatus:
        student.totalAssessment - student.totalPaid <= 0
          ? "Fully Paid"
          : "Has Balance",
    }));

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
      reportName: "Financial Assessment Summary",
      generatedAt: new Date(),
      totalRecords: reportData.length,
      summary: {
        totalAssessments,
        totalPaid,
        totalBalance,
        fullyPaidCount: reportData.filter((item) => item.balance <= 0).length,
        withBalanceCount: reportData.filter((item) => item.balance > 0).length,
      },
      filters: { periodId },
      data: reportData,
    });
  } catch (error) {
    console.error("Error generating financial assessment report:", error);
    res.status(500).json({
      error: true,
      message: "Error generating report",
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
      "1.0-1.5": { min: 1.0, max: 1.5, count: 0 },
      "1.6-2.0": { min: 1.6, max: 2.0, count: 0 },
      "2.1-2.5": { min: 2.1, max: 2.5, count: 0 },
      "2.6-3.0": { min: 2.6, max: 3.0, count: 0 },
      "3.1-5.0": { min: 3.1, max: 5.0, count: 0 },
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
          g.user?.middleName ? " " + g.user?.middleName : ""
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
      reportName: "Grade Distribution Report",
      generatedAt: new Date(),
      totalRecords: reportData.length,
      distribution: gradeRanges,
      filters: { periodId, courseId, gradeRange },
      data: reportData,
    });
  } catch (error) {
    console.error("Error generating grade distribution report:", error);
    res.status(500).json({
      error: true,
      message: "Error generating report",
      details: error.message,
    });
  }
};

// Report 4: Course Enrollment Statistics
const getCourseEnrollmentStatistics = async (req, res) => {
  try {
    const { periodId, courseIds } = req.query;

    if (!periodId) {
      return res.status(400).json({
        error: true,
        message: "Period ID is required",
      });
    }

    let whereClause = {
      deletedAt: null,
    };

    if (periodId) whereClause.periodId = periodId;
    if (courseIds) {
      whereClause.courseId = {
        in: Array.isArray(courseIds) ? courseIds : courseIds.split(","),
      };
    }

    const schedules = await prisma.schedule.findMany({
      where: whereClause,
      select: {
        courseId: true,
        capacity: true,
        days: true,
        time_start: true,
        time_end: true,
        course: {
          select: {
            id: true,
            name: true,
          },
        },
        userSchedules: {
          where: {
            deletedAt: null,
            user: {
              role: "student",
              deletedAt: null,
            },
          },
          select: {
            id: true,
          },
        },
      },

      orderBy: {
        courseId: "asc",
      },
    });

    const period = await prisma.academic_period.findUnique({
      where: {
        id: periodId,
      },
    });

    const reportData = schedules.map((schedule) => ({
      courseName: schedule.course?.name,
      enrolledStudents: schedule.userSchedules.length,
      capacity: schedule.capacity || 0,
      occupancyRate: schedule.capacity
        ? `${(
            (schedule.userSchedules.length / schedule.capacity) *
            100
          ).toFixed(2)}%`
        : "N/A",
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
      reportName: "Course Enrollment Statistics",
      generatedAt: new Date(),
      totalRecords: reportData.length,
      summary: {
        periodId: period.id || "N/A",
        batchName: period?.batchName || "N/A",
        startDate: new Date(period.startAt).toLocaleDateString() || "N/A",
        endDate: new Date(period.endAt).toLocaleDateString() || "N/A",
        isEnrollmentClosed: period.isEnrollmentClosed ? "Closed" : "Open",
        totalSections: reportData.length,
        totalEnrolledStudents: totalEnrolled,
        averageEnrollmentPerSection: (
          totalEnrolled / reportData.length || 0
        ).toFixed(2),
      },
      filters: { periodId, courseIds },
      data: reportData,
    });
  } catch (error) {
    console.error("Error generating course enrollment statistics:", error);
    res.status(500).json({
      error: true,
      message: "Error generating report",
      details: error.message,
    });
  }
};

// Report 5: Transaction History Report
const getTransactionHistoryReport = async (req, res) => {
  try {
    const { startDate, endDate, minAmount, maxAmount } = req.query;

    // Validate required date range
    if (!startDate || !endDate) {
      return res.status(400).json({
        error: true,
        message: "Start Date and End Date are required",
      });
    }

    // Make end date inclusive of the full day (23:59:59.999)
    const startDateTime = new Date(startDate);
    startDateTime.setHours(0, 0, 0, 0);

    const endDateTime = new Date(endDate);
    endDateTime.setHours(23, 59, 59, 999);

    let whereClause = {
      paidAt: {
        gte: startDateTime,
        lte: endDateTime,
      },
      status: "paid", // Only show paid transactions
    };

    // Get all payments within the date range
    const transactions = await prisma.payments.findMany({
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
        course: {
          select: {
            name: true,
          },
        },
        academicPeriod: {
          select: {
            batchName: true,
            startAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    let reportData = transactions.map((transaction) => ({
      transactionId: transaction.transactionId,
      paymentId: transaction.id,
      studentId: transaction.user?.userId,
      fullName: `${transaction.user?.firstName}${
        transaction.user?.middleName ? " " + transaction.user?.middleName : ""
      } ${transaction.user?.lastName}`,
      email: transaction.user?.email,
      courseName: transaction.course?.name || "N/A",
      academicPeriod: transaction.academicPeriod?.batchName || "N/A",
      academicYear: transaction.academicPeriod?.startAt
        ? new Date(transaction.academicPeriod.startAt).getFullYear()
        : "N/A",
      amount: parseFloat(transaction.amount),
      currency: transaction.currency,
      status: transaction.status,
      paymentMethod: transaction.paymentMethod || "N/A",
      referenceNumber: transaction.referenceNumber || "N/A",
      transactionDate: transaction.createdAt,
      paidAt: transaction.paidAt,
      remarks: transaction.remarks || "",
    }));

    // Filter by amount range if provided
    if (minAmount) {
      reportData = reportData.filter(
        (item) => item.amount >= parseFloat(minAmount)
      );
    }
    if (maxAmount) {
      reportData = reportData.filter(
        (item) => item.amount <= parseFloat(maxAmount)
      );
    }

    const totalAmount = reportData.reduce((sum, item) => sum + item.amount, 0);
    const paidTransactions = reportData.filter(
      (item) => item.status === "paid"
    ).length;

    res.json({
      error: false,
      reportName: "Transaction History Report",
      generatedAt: new Date(),
      totalRecords: reportData.length,
      summary: {
        totalTransactions: reportData.length,
        paidTransactions: paidTransactions,
        pendingTransactions: reportData.length - paidTransactions,
        totalAmount: totalAmount,
        dateRange: `${new Date(startDate).toLocaleDateString()} - ${new Date(
          endDate
        ).toLocaleDateString()}`,
        dateRangeFrom: startDate,
        dateRangeTo: endDate,
        note: "Report filtered by payment date (paidAt)",
      },
      filters: { startDate, endDate, minAmount, maxAmount },
      data: reportData,
    });
  } catch (error) {
    console.error("Error generating transaction history report:", error);
    res.status(500).json({
      error: true,
      message: "Error generating report",
      details: error.message,
    });
  }
};

// Report 6: Faculty Teaching Load Report
const getFacultyTeachingLoadReport = async (req, res) => {
  try {
    const { periodId, teacherIds } = req.query;

    let whereClause = {
      deletedAt: null,
      ...(teacherIds && { teacherId: { in: teacherIds.split(",") } }),
    };

    if (periodId) whereClause.periodId = periodId;

    const schedules = await prisma.schedule.findMany({
      where: whereClause,
      include: {
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
        teacher: {
          select: {
            id: true,
            userId: true,
            firstName: true,
            middleName: true,
            lastName: true,
            email: true,
          },
        },
        userSchedules: {
          where: {
            deletedAt: null,
          },
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        teacher: {
          lastName: "asc",
        },
      },
    });

    // Group by teacher
    console.log("schedules", JSON.stringify(schedules, null, 2));
    let teacherLoads = [];
    schedules.forEach((schedule) => {
      // Skip schedules without assigned teacher to avoid undefined accesses
      if (!schedule.teacher) {
        return;
      }

      const existingTeacher = teacherLoads.find(
        (t) => t.teacherId === schedule.teacher.userId
      );
      if (!existingTeacher) {
        teacherLoads = [
          ...teacherLoads,
          {
            teacherId: schedule.teacher.userId,
            fullName: `${schedule.teacher.firstName}${
              schedule.teacher.middleName
                ? " " + schedule.teacher.middleName
                : ""
            } ${schedule.teacher.lastName}`,
            email: schedule.teacher.email,
            totalStudents: 0,
            totalCourses: 0,
            courses: [],
          },
        ];
      }

      // Recompute index after potential push above
      const index = teacherLoads.findIndex(
        (t) => t.teacherId === schedule.teacher.userId
      );
      if (index === -1) {
        return;
      }

      teacherLoads[index].totalStudents += schedule.userSchedules.length;

      // Ensure course entry exists
      let courseIndex = teacherLoads[index].courses.findIndex(
        (c) => c.courseId === schedule.course?.id
      );
      if (courseIndex === -1) {
        teacherLoads[index].courses.push({
          courseId: schedule.course?.id,
          courseName: schedule.course?.name,
          totalStudents: 0,
        });
        courseIndex = teacherLoads[index].courses.length - 1;
      }

      teacherLoads[index].courses[courseIndex].totalStudents +=
        schedule.userSchedules.length;
      teacherLoads[index].totalCourses += 1;
    });

    res.json({
      error: false,
      reportName: "Teacher Teaching Load Report",
      generatedAt: new Date(),
      totalRecords: teacherLoads.length,
      filters: { periodId, teacherIds },
      data: teacherLoads,
    });
  } catch (error) {
    console.error("Error generating teacher teaching load report:", error);
    res.status(500).json({
      error: true,
      message: "Error generating report",
      details: error.message,
    });
  }
};

// Report 8: Enrollment Period Analysis
const getEnrollmentPeriodAnalysis = async (req, res) => {
  try {
    const { periodId } = req.query;

    let whereClause = {
      deletedAt: null,
    };

    // If periodId is provided, filter by specific period
    if (periodId) {
      whereClause.id = periodId;
    }

    const periods = await prisma.academic_period.findMany({
      where: whereClause,
      include: {
        schedules: {
          where: {
            deletedAt: null,
          },
          include: {
            userSchedules: {
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
        startAt: "desc",
      },
    });

    const reportData = periods.map((period) => {
      const totalSections = period.schedules.length;
      const totalEnrollments = period.schedules.reduce(
        (sum, s) => sum + s.userSchedules.length,
        0
      );

      return {
        periodId: period.id,
        batchName: period.batchName,
        academicYear: period.startAt
          ? new Date(period.startAt).getFullYear()
          : "N/A",
        startDate: period.startAt
          ? new Date(period.startAt).toLocaleDateString()
          : "N/A",
        endDate: period.endAt
          ? new Date(period.endAt).toLocaleDateString()
          : "N/A",
        enrollmentOpenAt: period.enrollmentOpenAt
          ? new Date(period.enrollmentOpenAt).toLocaleDateString()
          : "N/A",
        enrollmentCloseAt: period.enrollmentCloseAt
          ? new Date(period.enrollmentCloseAt).toLocaleDateString()
          : "N/A",
        isEnrollmentClosed: period.isEnrollmentClosed ? "Closed" : "Open",
        totalSections: totalSections,
        totalEnrollments: totalEnrollments,
        averageEnrollmentPerSection:
          totalSections > 0 ? (totalEnrollments / totalSections).toFixed(2) : 0,
        createdAt: period.createdAt,
      };
    });

    res.json({
      error: false,
      reportName: "Enrollment Period Analysis",
      generatedAt: new Date(),
      totalRecords: reportData.length,
      summary: {
        totalPeriods: reportData.length,
        totalEnrollmentsAcrossPeriods: reportData.reduce(
          (sum, p) => sum + p.totalEnrollments,
          0
        ),
        totalSectionsAcrossPeriods: reportData.reduce(
          (sum, p) => sum + p.totalSections,
          0
        ),
      },
      filters: { periodId },
      data: reportData,
    });
  } catch (error) {
    console.error("Error generating enrollment period analysis:", error);
    res.status(500).json({
      error: true,
      message: "Error generating report",
      details: error.message,
    });
  }
};

// Report 9: Outstanding Balance Report
const getOutstandingBalanceReport = async (req, res) => {
  try {
    const { periodId, minBalance = 0.01 } = req.query;

    // Build where clause for user_schedule
    let scheduleWhere = {
      deletedAt: null,
    };
    if (periodId) {
      scheduleWhere.schedule = {
        periodId: periodId,
        deletedAt: null,
      };
    } else {
      scheduleWhere.schedule = {
        deletedAt: null,
      };
    }

    // Get all user_schedules for students
    const userSchedules = await prisma.user_schedule.findMany({
      where: {
        ...scheduleWhere,
        user: {
          role: "student",
        },
      },
      include: {
        user: {
          select: {
            id: true,
            userId: true,
            firstName: true,
            middleName: true,
            lastName: true,
            email: true,
          },
        },
        schedule: {
          include: {
            course: {
              select: {
                id: true,
                name: true,
                price: true,
              },
            },
            period: {
              select: {
                id: true,
                batchName: true,
                startAt: true,
              },
            },
          },
        },
      },
    });

    // Group by student, course, and period to calculate balances
    const studentBalances = new Map();

    for (const us of userSchedules) {
      if (!us.user || !us.schedule || !us.schedule.course || !us.schedule.period) {
        continue;
      }

      const studentId = us.user.id;
      const courseId = us.schedule.course.id;
      const batchId = us.schedule.period.id;

      // Get fees for this course and batch
      const fees = await prisma.fees.findMany({
        where: {
          courseId: courseId,
          batchId: batchId,
          isActive: true,
        },
      });

      // Get student-specific fees
      const studentFees = await prisma.student_fee.findMany({
        where: {
          studentId: studentId,
          courseId: courseId,
          batchId: batchId,
          deletedAt: null,
        },
      });

      // Get payments for this student, course, and batch
      const payments = await prisma.payments.findMany({
        where: {
          userId: studentId,
          status: "paid",
          courseId: courseId,
          academicPeriodId: batchId,
        },
        orderBy: {
          paidAt: "desc",
        },
      });

      // Get adjustments for this student
      const adjustments = await prisma.adjustments.findMany({
        where: {
          userId: studentId,
        },
      });

      // Calculate totals
      const courseBasePrice = Number(us.schedule.course.price) || 0;
      const feesTotal = fees.reduce((sum, f) => sum + Number(f.price), 0);
      const studentFeeTotal = studentFees.reduce((sum, sf) => {
        if (sf.type === "fee") return sum + Number(sf.amount);
        if (sf.type === "discount") return sum - Number(sf.amount);
        return sum;
      }, 0);
      const adjustmentsTotal = adjustments.reduce((sum, a) => sum + Number(a.amount), 0);
      const netAssessment = feesTotal + courseBasePrice + studentFeeTotal - adjustmentsTotal;
      const totalPayments = payments.reduce((sum, p) => sum + Number(p.amount), 0);
      const balance = netAssessment - totalPayments;

      // Only include if balance >= minBalance
      if (balance >= parseFloat(minBalance)) {
        const key = `${studentId}|${courseId}|${batchId}`;

        // Calculate aging based on last payment
        let daysSinceLastPayment = 0;
        let lastPaymentDate = null;
        let lastPaymentAmount = 0;

        if (payments.length > 0) {
          lastPaymentDate = payments[0].paidAt;
          lastPaymentAmount = Number(payments[0].amount);
          daysSinceLastPayment = Math.floor(
            (new Date() - new Date(lastPaymentDate)) / (1000 * 60 * 60 * 24)
          );
        }

        let agingCategory = "Current";
        if (daysSinceLastPayment > 90) agingCategory = "90+ days";
        else if (daysSinceLastPayment > 60) agingCategory = "60-90 days";
        else if (daysSinceLastPayment > 30) agingCategory = "30-60 days";

        studentBalances.set(key, {
          studentId: us.user.userId,
          fullName: `${us.user.firstName}${
            us.user.middleName ? " " + us.user.middleName : ""
          } ${us.user.lastName}`,
          email: us.user.email,
          course: us.schedule.course.name,
          academicPeriod: us.schedule.period.batchName,
          academicYear: us.schedule.period.startAt
            ? new Date(us.schedule.period.startAt).getFullYear()
            : null,
          balance: balance,
          netAssessment: netAssessment,
          totalPayments: totalPayments,
          lastPaymentDate: lastPaymentDate,
          lastPaymentAmount: lastPaymentAmount,
          daysSinceLastPayment: daysSinceLastPayment,
          agingCategory: agingCategory,
        });
      }
    }

    // Convert to array and sort by balance descending
    const reportData = Array.from(studentBalances.values())
      .sort((a, b) => b.balance - a.balance);

    // Calculate summary statistics
    const totalOutstanding = reportData.reduce((sum, item) => sum + item.balance, 0);
    const agingSummary = {
      current: reportData.filter(item => item.agingCategory === "Current").length,
      "30-60 days": reportData.filter(item => item.agingCategory === "30-60 days").length,
      "60-90 days": reportData.filter(item => item.agingCategory === "60-90 days").length,
      "90+ days": reportData.filter(item => item.agingCategory === "90+ days").length,
    };

    res.json({
      error: false,
      reportName: "Outstanding Balance Report",
      generatedAt: new Date(),
      totalRecords: reportData.length,
      summary: {
        totalOutstandingBalance: totalOutstanding,
        agingBreakdown: agingSummary,
        averageBalance: reportData.length > 0 ? totalOutstanding / reportData.length : 0,
      },
      filters: {
        periodId: periodId || "All Periods",
        minBalance: parseFloat(minBalance),
      },
      data: reportData,
    });
  } catch (error) {
    console.error("Error generating outstanding balance report:", error);
    res.status(500).json({
      error: true,
      message: "Error generating report",
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
        createdAt: "desc",
      },
    });

    const reportData = documents.map((doc) => ({
      documentId: doc.id,
      studentId: doc.user?.userId,
      fullName: `${doc.user?.firstName}${
        doc.user?.middleName ? " " + doc.user?.middleName : ""
      } ${doc.user?.lastName}`,
      email: doc.user?.email,
      documentType: doc.type,
      documentName: doc.name,
      status: doc.status,
      submittedDate: doc.createdAt,
      validatedDate: doc.validatedAt,
      remarks: doc.remarks || "N/A",
    }));

    // Count by status
    const statusCounts = reportData.reduce((acc, doc) => {
      acc[doc.status] = (acc[doc.status] || 0) + 1;
      return acc;
    }, {});

    res.json({
      error: false,
      reportName: "Document Submission Status Report",
      generatedAt: new Date(),
      totalRecords: reportData.length,
      summary: {
        statusBreakdown: statusCounts,
      },
      filters: { status, studentId },
      data: reportData,
    });
  } catch (error) {
    console.error("Error generating document submission status report:", error);
    res.status(500).json({
      error: true,
      message: "Error generating report",
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
      orderBy: [{ days: "asc" }, { time_start: "asc" }],
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
              ? " " + schedule.teacherUser.middleName
              : ""
          } ${schedule.teacherUser.lastName}`
        : "TBA",
      instructorId: schedule.teacherUser?.userId,
      days: schedule.days,
      timeStart: schedule.time_start,
      timeEnd: schedule.time_end,
      room: schedule.room || "TBA",
      enrolledStudents: schedule.user_schedule.length,
      capacity: schedule.capacity || "N/A",
    }));

    res.json({
      error: false,
      reportName: "Class Schedule Report",
      generatedAt: new Date(),
      totalRecords: reportData.length,
      filters: { periodId, courseId, days },
      data: reportData,
    });
  } catch (error) {
    console.error("Error generating class schedule report:", error);
    res.status(500).json({
      error: true,
      message: "Error generating report",
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
        message: "studentId is required for this report",
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
        createdAt: "asc",
      },
    });

    if (ledgers.length === 0) {
      return res.json({
        error: false,
        reportName: "Student Ledger Summary",
        generatedAt: new Date(),
        message: "No ledger entries found for this student",
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
        student.middleName ? " " + student.middleName : ""
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
        paymentMethod: ledger.paymentMethod || "N/A",
        referenceNumber: ledger.referenceNumber || "N/A",
      })),
    };

    res.json({
      error: false,
      reportName: "Student Ledger Summary",
      generatedAt: new Date(),
      filters: { studentId, periodId },
      data: reportData,
    });
  } catch (error) {
    console.error("Error generating student ledger summary:", error);
    res.status(500).json({
      error: true,
      message: "Error generating report",
      details: error.message,
    });
  }
};

// Report 13: Enrollment Requests Log
const getEnrollmentRequestsLog = async (req, res) => {
  try {
    const { periodIds } = req.query;

    let whereClause = {};
    if (!periodIds) {
      return res.status(400).json({
        error: true,
        message: "Please select at least one academic period",
      });
    }
    if (periodIds) whereClause.periodId = { in: periodIds.split(",") };

    const enrollments = await prisma.enrollment_request.findMany({
      where: whereClause,
      include: {
        payments: {
          select: {
            amount: true,
            paymentMethod: true,
            status: true,
            referenceNumber: true,
          },
        },
        period: {
          select: {
            batchName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const reportData = enrollments;
    console.log("repdata", reportData);
    res.json({
      error: false,
      reportName: "Enrollment Requests Log",
      generatedAt: new Date(),
      summary: {
        totalRecords: reportData.length,
      },
      filters: { periodIds },
      data: reportData,
    });
  } catch (error) {
    console.error("Error generating enrollment requests log:", error);
    res.status(500).json({
      error: true,
      message: "Error generating report",
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
      orderBy: [{ feeType: "asc" }, { amount: "desc" }],
    });

    const reportData = fees.map((fee) => ({
      feeId: fee.id,
      feeName: fee.name,
      feeType: fee.feeType,
      amount: parseFloat(fee.amount),
      yearLevel: fee.yearLevel || "All",
      program: fee.program || "All",
      academicPeriod: fee.academicPeriod?.name,
      schoolYear: fee.academicPeriod?.schoolYear,
      description: fee.description || "N/A",
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
      reportName: "Fee Structure Report",
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
    console.error("Error generating fee structure report:", error);
    res.status(500).json({
      error: true,
      message: "Error generating report",
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
        updatedAt: "desc",
      },
    });

    const reportData = users.map((user) => ({
      userId: user.userId,
      fullName: `${user.firstName}${
        user.middleName ? " " + user.middleName : ""
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
      reportName: "User Account Activity Report",
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
    console.error("Error generating user account activity report:", error);
    res.status(500).json({
      error: true,
      message: "Error generating report",
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
        role: "student",
        status: "active",
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
            : "N/A";

        // Get latest academic period from completed courses
        const latestCourse = completedCourses.sort(
          (a, b) =>
            new Date(b.schedule?.academicPeriod?.schoolYear) -
            new Date(a.schedule?.academicPeriod?.schoolYear)
        )[0];

        return {
          studentId: student.userId,
          fullName: `${student.firstName}${
            student.middleName ? " " + student.middleName : ""
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
      reportName: "Graduated Students Report",
      generatedAt: new Date(),
      totalRecords: reportData.length,
      filters: { schoolYear, program },
      data: reportData,
    });
  } catch (error) {
    console.error("Error generating graduated students report:", error);
    res.status(500).json({
      error: true,
      message: "Error generating report",
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

    if (!recordType || recordType === "users") {
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
          deletedAt: "desc",
        },
      });

      reportData.users = archivedUsers.map((user) => ({
        userId: user.userId,
        fullName: `${user.firstName}${
          user.middleName ? " " + user.middleName : ""
        } ${user.lastName}`,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        archivedAt: user.deletedAt,
      }));
    }

    if (!recordType || recordType === "courses") {
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
          deletedAt: "desc",
        },
      });

      reportData.courses = archivedCourses;
    }

    if (!recordType || recordType === "schedules") {
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
          deletedAt: "desc",
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
      reportName: "Archived Records Report",
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
    console.error("Error generating archived records report:", error);
    res.status(500).json({
      error: true,
      message: "Error generating report",
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
        schoolYear: "asc",
      },
    });

    // Group enrollments by academic period and program/course
    const trendsData = periods.map((period) => {
      const programStats = {};

      period.schedule.forEach((schedule) => {
        const programKey =
          schedule.course?.courseCode?.substring(0, 3) || "Unknown";

        if (!programStats[programKey]) {
          programStats[programKey] = {
            program: programKey,
            totalEnrollments: 0,
            courses: {},
          };
        }

        programStats[programKey].totalEnrollments +=
          schedule.user_schedule.length;

        const courseKey = schedule.course?.courseCode || "Unknown";
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
      reportName: "Program Enrollment Trends",
      generatedAt: new Date(),
      totalPeriods: trendsData.length,
      filters: { startYear, endYear },
      data: trendsData,
    });
  } catch (error) {
    console.error("Error generating program enrollment trends:", error);
    res.status(500).json({
      error: true,
      message: "Error generating report",
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
