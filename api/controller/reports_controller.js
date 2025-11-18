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
      if (
        !us.user ||
        !us.schedule ||
        !us.schedule.course ||
        !us.schedule.period
      ) {
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
      const adjustmentsTotal = adjustments.reduce(
        (sum, a) => sum + Number(a.amount),
        0
      );
      const netAssessment =
        feesTotal + courseBasePrice + studentFeeTotal - adjustmentsTotal;
      const totalPayments = payments.reduce(
        (sum, p) => sum + Number(p.amount),
        0
      );
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
    const reportData = Array.from(studentBalances.values()).sort(
      (a, b) => b.balance - a.balance
    );

    // Calculate summary statistics
    const totalOutstanding = reportData.reduce(
      (sum, item) => sum + item.balance,
      0
    );
    const agingSummary = {
      current: reportData.filter((item) => item.agingCategory === "Current")
        .length,
      "30-60 days": reportData.filter(
        (item) => item.agingCategory === "30-60 days"
      ).length,
      "60-90 days": reportData.filter(
        (item) => item.agingCategory === "60-90 days"
      ).length,
      "90+ days": reportData.filter((item) => item.agingCategory === "90+ days")
        .length,
    };

    res.json({
      error: false,
      reportName: "Outstanding Balance Report",
      generatedAt: new Date(),
      totalRecords: reportData.length,
      summary: {
        totalOutstandingBalance: totalOutstanding,
        agingBreakdown: agingSummary,
        averageBalance:
          reportData.length > 0 ? totalOutstanding / reportData.length : 0,
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
    const { status, studentIds } = req.query;

    let whereClause = {};

    // Filter by status if provided
    if (status && status !== "") {
      whereClause.status = status;
    }

    // Filter by student IDs if provided (multi-select)
    if (studentIds) {
      const studentIdArray = Array.isArray(studentIds)
        ? studentIds
        : studentIds.split(",");

      whereClause.userId = {
        in: studentIdArray,
      };
    }

    // Get all document requests with related data
    const documentRequests = await prisma.document_request.findMany({
      where: whereClause,
      include: {
        document: {
          select: {
            id: true,
            documentName: true,
            price: true,
            amount: true,
          },
        },
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
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Map to report data
    const reportData = documentRequests.map((request) => ({
      requestId: request.id,
      studentId: request.user?.userId || "N/A",
      studentName: request.user
        ? `${request.user.firstName}${
            request.user.middleName ? " " + request.user.middleName : ""
          } ${request.user.lastName}`
        : `${request.firstName || ""} ${request.lastName || ""}`.trim(),
      email: request.user?.email || request.email,
      phone: request.phone || "N/A",
      documentName: request.document?.documentName || "Unknown Document",
      documentType: request.document?.price || "free",
      requestDate: request.createdAt,
      status: request.status,
      deliveryMode: request.mode || "N/A",
      paymentStatus: request.paymentStatus || "N/A",
      paymentAmount: request.paymentAmount ? Number(request.paymentAmount) : 0,
      paymentMethod: request.paymentMethod || "N/A",
      purpose: request.purpose || "N/A",
      address: request.address || "N/A",
      city: request.city || "N/A",
      fulfilledDate: request.updatedAt,
      hasFulfilledDocument: request.fulfilledDocumentUrl ? "Yes" : "No",
      remarks: request.remarks || "N/A",
    }));

    // Calculate summary statistics
    const statusCounts = reportData.reduce((acc, doc) => {
      acc[doc.status] = (acc[doc.status] || 0) + 1;
      return acc;
    }, {});

    const documentTypeCounts = reportData.reduce((acc, doc) => {
      acc[doc.documentName] = (acc[doc.documentName] || 0) + 1;
      return acc;
    }, {});

    const paymentStats = {
      totalRequests: reportData.length,
      paidRequests: reportData.filter((d) => d.paymentStatus === "paid").length,
      pendingPayments: reportData.filter((d) => d.paymentStatus === "pending")
        .length,
      totalRevenue: reportData
        .filter((d) => d.paymentStatus === "paid")
        .reduce((sum, d) => sum + d.paymentAmount, 0),
    };

    const deliveryModeCounts = reportData.reduce((acc, doc) => {
      acc[doc.deliveryMode] = (acc[doc.deliveryMode] || 0) + 1;
      return acc;
    }, {});

    res.json({
      error: false,
      reportName: "Document Submission Status Report",
      generatedAt: new Date(),
      totalRecords: reportData.length,
      summary: {
        statusBreakdown: statusCounts,
        documentTypeBreakdown: documentTypeCounts,
        paymentStatistics: paymentStats,
        deliveryModeBreakdown: deliveryModeCounts,
      },
      filters: {
        status: status || "All",
        studentIds: studentIds || "All Students",
      },
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
    const { periodId } = req.query;

    if (!periodId) {
      return res.status(400).json({
        error: true,
        message: "Academic Period is required",
      });
    }

    // Get all schedules for the selected academic period
    const schedules = await prisma.schedule.findMany({
      where: {
        periodId: periodId,
        deletedAt: null,
      },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
          },
        },
        period: {
          select: {
            id: true,
            batchName: true,
            startAt: true,
            endAt: true,
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
      orderBy: [{ days: "asc" }, { time_start: "asc" }],
    });

    // Map schedules to report data
    const reportData = schedules.map((schedule) => ({
      scheduleId: schedule.id,
      courseName: schedule.course?.name || "N/A",
      courseDescription: schedule.course?.description || "N/A",
      coursePrice: schedule.course?.price ? Number(schedule.course.price) : 0,
      academicPeriod: schedule.period?.batchName || "N/A",
      academicYear: schedule.period?.startAt
        ? new Date(schedule.period.startAt).getFullYear()
        : null,
      periodStart: schedule.periodStart,
      periodEnd: schedule.periodEnd,
      instructor: schedule.teacher
        ? `${schedule.teacher.firstName}${
            schedule.teacher.middleName ? " " + schedule.teacher.middleName : ""
          } ${schedule.teacher.lastName}`
        : "TBA",
      instructorId: schedule.teacher?.userId || "N/A",
      instructorEmail: schedule.teacher?.email || "N/A",
      days: schedule.days,
      timeStart: schedule.time_start || "N/A",
      timeEnd: schedule.time_end || "N/A",
      time: schedule.time || "N/A",
      location: schedule.location || "TBA",
      notes: schedule.notes || "N/A",
      enrolledStudents: schedule.userSchedules?.length || 0,
      capacity: schedule.capacity || 30,
      availableSlots:
        (schedule.capacity || 30) - (schedule.userSchedules?.length || 0),
    }));

    // Calculate summary statistics
    const totalSchedules = reportData.length;
    const uniqueCourses = new Set(reportData.map((s) => s.courseName)).size;
    const uniqueInstructors = new Set(
      reportData.filter((s) => s.instructor !== "TBA").map((s) => s.instructor)
    ).size;
    const totalEnrolled = reportData.reduce(
      (sum, s) => sum + s.enrolledStudents,
      0
    );
    const totalCapacity = reportData.reduce((sum, s) => sum + s.capacity, 0);

    // Group by course for course breakdown
    const courseBreakdown = reportData.reduce((acc, schedule) => {
      const courseName = schedule.courseName;
      if (!acc[courseName]) {
        acc[courseName] = {
          schedules: 0,
          enrolled: 0,
          capacity: 0,
        };
      }
      acc[courseName].schedules += 1;
      acc[courseName].enrolled += schedule.enrolledStudents;
      acc[courseName].capacity += schedule.capacity;
      return acc;
    }, {});

    res.json({
      error: false,
      reportName: "Class Schedule Report",
      generatedAt: new Date(),
      totalRecords: reportData.length,
      summary: {
        totalSchedules,
        uniqueCourses,
        uniqueInstructors,
        totalEnrolledStudents: totalEnrolled,
        totalCapacity,
        availableSlots: totalCapacity - totalEnrolled,
        utilizationRate:
          totalCapacity > 0
            ? ((totalEnrolled / totalCapacity) * 100).toFixed(2) + "%"
            : "0%",
        courseBreakdown,
      },
      filters: {
        periodId: periodId,
        academicPeriod: schedules[0]?.period?.batchName || "N/A",
      },
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
    const { studentId } = req.query;

    if (!studentId) {
      return res.status(400).json({
        error: true,
        message: "Student is required for this report",
      });
    }

    // Get student information
    const student = await prisma.users.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        userId: true,
        firstName: true,
        middleName: true,
        lastName: true,
        email: true,
      },
    });

    if (!student) {
      return res.status(404).json({
        error: true,
        message: "Student not found",
      });
    }

    // Get all user_schedules for this student (active only)
    const userSchedules = await prisma.user_schedule.findMany({
      where: { userId: studentId, deletedAt: null },
      include: {
        schedule: {
          include: {
            course: true,
            period: true,
          },
        },
      },
    });

    // Build ledger rows
    let ledgerRows = [];

    // For each schedule, get course fees and student fees
    for (const us of userSchedules) {
      if (!us.schedule || !us.schedule.course || !us.schedule.period) continue;
      const course = us.schedule.course;
      const batch = us.schedule.period;

      // 1. Base course fee (debit)
      if (course.price && Number(course.price) > 0) {
        ledgerRows.push({
          date: us.createdAt,
          description: `Course Fee (${course.name})`,
          debit: Number(course.price),
          credit: 0,
          type: "Course Fee",
          remarks: "",
          courseName: course.name,
          academicPeriod: batch.batchName,
          academicYear: batch.startAt
            ? new Date(batch.startAt).getFullYear()
            : null,
        });
      }

      // 2. Other course fees (debits)
      const courseFees = await prisma.fees.findMany({
        where: {
          courseId: course.id,
          batchId: batch.id,
          isActive: true,
        },
      });
      courseFees.forEach((fee) => {
        ledgerRows.push({
          date: fee.createdAt,
          description: fee.name,
          debit: Number(fee.price),
          credit: 0,
          type: "Other Fee",
          remarks: "",
          courseName: course.name,
          academicPeriod: batch.batchName,
          academicYear: batch.startAt
            ? new Date(batch.startAt).getFullYear()
            : null,
        });
      });

      // 3. Student fees/discounts
      const studentFees = await prisma.student_fee.findMany({
        where: {
          studentId,
          courseId: course.id,
          batchId: batch.id,
          deletedAt: null,
        },
      });
      studentFees.forEach((sf) => {
        if (sf.type === "fee") {
          ledgerRows.push({
            date: sf.createdAt,
            description: sf.name,
            debit: Number(sf.amount),
            credit: 0,
            type: "Additional Fee",
            remarks: "",
            courseName: course.name,
            academicPeriod: batch.batchName,
            academicYear: batch.startAt
              ? new Date(batch.startAt).getFullYear()
              : null,
          });
        } else if (sf.type === "discount") {
          ledgerRows.push({
            date: sf.createdAt,
            description: sf.name,
            debit: 0,
            credit: Number(sf.amount),
            type: "Discount",
            remarks: "",
            courseName: course.name,
            academicPeriod: batch.batchName,
            academicYear: batch.startAt
              ? new Date(batch.startAt).getFullYear()
              : null,
          });
        }
      });
    }

    // 4. Payments (credits)
    const payments = await prisma.payments.findMany({
      where: {
        userId: studentId,
        status: "paid",
      },
    });
    payments.forEach((payment) => {
      ledgerRows.push({
        date: payment.paidAt || payment.createdAt,
        description: "Payment",
        debit: 0,
        credit: Number(payment.amount),
        type: "Payment",
        remarks: payment.remarks || "",
        orNumber: payment.referenceNumber || "",
        paymentMethod: payment.paymentMethod || "N/A",
        courseName: "N/A",
        academicPeriod: "N/A",
        academicYear: null,
      });
    });

    // 5. Sort by date ascending
    ledgerRows.sort((a, b) => new Date(a.date) - new Date(b.date));

    // 6. Add running balance
    let balance = 0;
    ledgerRows = ledgerRows.map((row) => {
      balance += (row.debit || 0) - (row.credit || 0);
      return { ...row, balance };
    });

    // Calculate summary statistics
    const totalDebits = ledgerRows.reduce((sum, row) => sum + row.debit, 0);
    const totalCredits = ledgerRows.reduce((sum, row) => sum + row.credit, 0);
    const currentBalance = balance;

    res.json({
      error: false,
      reportName: "Student Ledger Summary",
      generatedAt: new Date(),
      totalRecords: ledgerRows.length,
      summary: {
        studentId: student.userId,
        studentName: `${student.firstName}${
          student.middleName ? " " + student.middleName : ""
        } ${student.lastName}`,
        email: student.email,
        totalCharges: totalDebits,
        totalPayments: totalCredits,
        currentBalance: currentBalance,
        totalTransactions: ledgerRows.length,
      },
      filters: {
        studentId: student.userId,
        studentName: `${student.firstName} ${student.lastName}`,
      },
      data: ledgerRows,
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
    const { periodId } = req.query;

    if (!periodId) {
      return res.status(400).json({
        error: true,
        message: "Academic Period is required",
      });
    }

    // Get all fees for the selected academic period
    const fees = await prisma.fees.findMany({
      where: {
        batchId: periodId,
        isActive: true,
      },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
          },
        },
      },
      orderBy: [{ courseId: "asc" }, { type: "asc" }, { name: "asc" }],
    });

    // Get academic period details
    const academicPeriod = await prisma.academic_period.findUnique({
      where: { id: periodId },
      select: {
        id: true,
        batchName: true,
        startAt: true,
        endAt: true,
      },
    });

    // Map fees to report data
    const reportData = fees.map((fee) => ({
      feeId: fee.id,
      courseName: fee.course?.name || "N/A",
      courseDescription: fee.course?.description || "N/A",
      courseBasePrice: fee.course?.price ? Number(fee.course.price) : 0,
      feeName: fee.name,
      feeType: fee.type,
      feePrice: Number(fee.price),
      dueDate: fee.dueDate,
      isActive: fee.isActive,
      createdAt: fee.createdAt,
    }));

    // Group by course
    const courseGroups = reportData.reduce((acc, fee) => {
      if (!acc[fee.courseName]) {
        acc[fee.courseName] = {
          courseName: fee.courseName,
          courseBasePrice: fee.courseBasePrice,
          fees: [],
          totalFees: 0,
          feeCount: 0,
        };
      }
      acc[fee.courseName].fees.push(fee);
      acc[fee.courseName].totalFees += fee.feePrice;
      acc[fee.courseName].feeCount += 1;
      return acc;
    }, {});

    // Group by fee type
    const feeTypeGroups = reportData.reduce((acc, fee) => {
      if (!acc[fee.feeType]) {
        acc[fee.feeType] = {
          type: fee.feeType,
          count: 0,
          totalAmount: 0,
        };
      }
      acc[fee.feeType].count += 1;
      acc[fee.feeType].totalAmount += fee.feePrice;
      return acc;
    }, {});

    // Calculate summary statistics
    const totalFees = reportData.reduce((sum, fee) => sum + fee.feePrice, 0);
    const totalCourses = Object.keys(courseGroups).length;
    const totalBasePrices = Object.values(courseGroups).reduce(
      (sum, course) => sum + course.courseBasePrice,
      0
    );

    res.json({
      error: false,
      reportName: "Fee Structure Report",
      generatedAt: new Date(),
      totalRecords: reportData.length,
      summary: {
        academicPeriod: academicPeriod?.batchName || "N/A",
        academicYear: academicPeriod?.startAt
          ? new Date(academicPeriod.startAt).getFullYear()
          : null,
        totalCourses,
        totalAdditionalFees: totalFees,
        totalBasePrices: totalBasePrices,
        grandTotal: totalFees + totalBasePrices,
        feeTypeBreakdown: Object.values(feeTypeGroups),
        courseBreakdown: Object.values(courseGroups).map((course) => ({
          courseName: course.courseName,
          basePrice: course.courseBasePrice,
          additionalFees: course.totalFees,
          totalPrice: course.courseBasePrice + course.totalFees,
          feeCount: course.feeCount,
        })),
      },
      filters: {
        periodId: periodId,
        academicPeriod: academicPeriod?.batchName || "N/A",
      },
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
    const { startDate, endDate, role, logType, moduleType, userIds } =
      req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        error: true,
        message: "Start Date and End Date are required",
      });
    }

    // Set up date range (inclusive of full end day)
    const startDateTime = new Date(startDate);
    startDateTime.setHours(0, 0, 0, 0);
    const endDateTime = new Date(endDate);
    endDateTime.setHours(23, 59, 59, 999);

    // Build where clause for logs
    let logsWhereClause = {
      createdAt: {
        gte: startDateTime,
        lte: endDateTime,
      },
    };

    // Filter by log type
    if (logType && logType !== "") {
      logsWhereClause.type = logType;
    }

    // Filter by module type
    if (moduleType && moduleType !== "") {
      logsWhereClause.moduleType = moduleType;
    }

    // Filter by specific users or role
    if (userIds) {
      const userIdArray = Array.isArray(userIds) ? userIds : userIds.split(",");
      logsWhereClause.userId = {
        in: userIdArray.map((id) => id.toString()),
      };
    } else if (role && role !== "") {
      // If filtering by role but not specific users, get all users with that role first
      const usersWithRole = await prisma.users.findMany({
        where: {
          role: role,
          deletedAt: null,
        },
        select: { userId: true },
      });

      if (usersWithRole.length > 0) {
        logsWhereClause.userId = {
          in: usersWithRole.map((u) => u.userId),
        };
      }
    }

    // Get all logs matching the criteria
    const logs = await prisma.logs.findMany({
      where: logsWhereClause,
      include: {
        user: {
          select: {
            id: true,
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
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Map to report data
    const reportData = logs.map((log) => ({
      logId: log.id,
      timestamp: log.createdAt,
      userId: log.user?.userId || log.userId || "N/A",
      userName: log.user
        ? `${log.user.firstName}${
            log.user.middleName ? " " + log.user.middleName : ""
          } ${log.user.lastName}`
        : "N/A",
      userEmail: log.user?.email || "N/A",
      userRole: log.user?.role || "N/A",
      userStatus: log.user?.status || "N/A",
      accountCreated: log.user?.createdAt || null,
      accountLastUpdated: log.user?.updatedAt || null,
      activityTitle: log.title,
      activityContent: log.content || "N/A",
      logType: log.type,
      moduleType: log.moduleType,
      requestBody: log.reqBody || "N/A",
    }));

    // Calculate summary statistics
    const totalLogs = reportData.length;
    const uniqueUsers = new Set(
      reportData.map((log) => log.userId).filter((id) => id !== "N/A")
    ).size;

    // Group by log type
    const logTypeBreakdown = reportData.reduce((acc, log) => {
      acc[log.logType] = (acc[log.logType] || 0) + 1;
      return acc;
    }, {});

    // Group by module type
    const moduleTypeBreakdown = reportData.reduce((acc, log) => {
      acc[log.moduleType] = (acc[log.moduleType] || 0) + 1;
      return acc;
    }, {});

    // Group by user role
    const roleBreakdown = reportData.reduce((acc, log) => {
      if (log.userRole !== "N/A") {
        acc[log.userRole] = (acc[log.userRole] || 0) + 1;
      }
      return acc;
    }, {});

    // Top active users
    const userActivityCount = reportData.reduce((acc, log) => {
      if (log.userId !== "N/A") {
        if (!acc[log.userId]) {
          acc[log.userId] = {
            userId: log.userId,
            userName: log.userName,
            role: log.userRole,
            activityCount: 0,
          };
        }
        acc[log.userId].activityCount += 1;
      }
      return acc;
    }, {});

    const topActiveUsers = Object.values(userActivityCount)
      .sort((a, b) => b.activityCount - a.activityCount)
      .slice(0, 10);

    res.json({
      error: false,
      reportName: "User Account Activity Report",
      generatedAt: new Date(),
      totalRecords: totalLogs,
      summary: {
        totalActivities: totalLogs,
        uniqueUsers: uniqueUsers,
        dateRange: `${new Date(startDate).toLocaleDateString()} - ${new Date(
          endDate
        ).toLocaleDateString()}`,
        logTypeBreakdown,
        moduleTypeBreakdown,
        roleBreakdown,
        topActiveUsers,
      },
      filters: {
        startDate: startDate,
        endDate: endDate,
        role: role || "All Roles",
        logType: logType || "All Types",
        moduleType: moduleType || "All Modules",
        userIds: userIds || "All Users",
      },
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
};
