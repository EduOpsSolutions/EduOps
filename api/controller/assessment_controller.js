import pkg from "@prisma/client";
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

export const getAssessmentByStudent = async (req, res) => {
  const { studentId } = req.params;
  const { courseId, academicPeriodId } = req.query;
  try {
    // 1. Get the user_schedule for this student, course, and period (filter on related schedule)
    const userSchedule = await prisma.user_schedule.findFirst({
      where: {
        userId: studentId,
        deletedAt: null,
        schedule: {
          ...(courseId ? { courseId } : {}),
          ...(academicPeriodId ? { periodId: academicPeriodId } : {}),
        },
      },
      include: {
        schedule: {
          include: {
            course: true,
            period: true,
          },
        },
        user: true,
      },
    });

    if (!userSchedule || !userSchedule.schedule) {
      return res.status(404).json({
        error: "Assessment not found for this student/course/period.",
      });
    }

    // 2. Fetch fees for this course and batch
    const fees = await prisma.fees.findMany({
      where: {
        courseId: userSchedule.schedule.courseId,
        batchId: userSchedule.schedule.periodId,
        isActive: true,
      },
    });

    // 2b. Fetch student_fee records for this student, course, and batch
    const studentFees = await prisma.student_fee.findMany({
      where: {
        studentId,
        courseId: userSchedule.schedule.courseId,
        batchId: userSchedule.schedule.periodId,
        deletedAt: null,
      },
    });

    // 3. Fetch payments for this student, course, and batch
    const payments = await prisma.payments.findMany({
      where: {
        userId: studentId,
        status: "paid",
        courseId: userSchedule.schedule.courseId,
        academicPeriodId: userSchedule.schedule.periodId,
      },
    });

    // 4. Fetch adjustments for this student and batch
    const adjustments = await prisma.adjustments.findMany({
      where: {
        userId: studentId,
        // Optionally filter by batchId if needed
      },
    });

    // 5. Fetch course base price
    const course = await prisma.course.findUnique({
      where: { id: userSchedule.schedule.courseId },
      select: { id: true, name: true, price: true },
    });
    const courseBasePrice = course ? Number(course.price) : 0;

    // 6. Calculate totals (include student_fee: add 'fee', subtract 'discount')
    const studentFeeTotal = studentFees.reduce((sum, sf) => {
      if (sf.type === "fee") return sum + Number(sf.amount);
      if (sf.type === "discount") return sum - Number(sf.amount);
      return sum;
    }, 0);
    const netAssessment =
      fees.reduce((sum, f) => sum + Number(f.price), 0) +
      courseBasePrice +
      studentFeeTotal -
      adjustments.reduce((sum, a) => sum + Number(a.amount), 0);
    const totalPayments = payments.reduce(
      (sum, p) => sum + Number(p.amount),
      0
    );
    const remainingBalance = netAssessment - totalPayments;

    // 7. Fetch batch details
    const batch = await prisma.academic_period.findUnique({
      where: { id: userSchedule.schedule.periodId },
      select: { id: true, batchName: true, startAt: true },
    });

    // 8. Respond with only the relevant data
    res.json({
      studentId: userSchedule.user.id,
      name: `${userSchedule.user.firstName} ${userSchedule.user.lastName}`,
      course: { id: course.id, name: course.name, price: course.price },
      batch: {
        id: batch.id,
        batchName: batch.batchName,
        year: batch.startAt ? new Date(batch.startAt).getFullYear() : null,
      },
      fees,
      studentFees,
      payments,
      adjustments,
      courseBasePrice,
      netAssessment,
      totalPayments,
      remainingBalance,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch assessment data." });
  }
};

export const listAssessments = async (req, res) => {
  try {
    // 1. Get all user_schedules (active only), including user, schedule, course, and period
    const userSchedules = await prisma.user_schedule.findMany({
      where: { deletedAt: null },
      include: {
        user: true,
        schedule: {
          include: {
            course: true,
            period: true,
          },
        },
      },
    });

    // 2. Group by student, course, and batch
    const assessmentMap = {};
    userSchedules.forEach((us) => {
      if (
        !us.user ||
        !us.schedule ||
        !us.schedule.course ||
        !us.schedule.period
      )
        return;
      const key = `${us.user.id}|${us.schedule.course.id}|${us.schedule.period.id}`;
      if (!assessmentMap[key]) {
        assessmentMap[key] = {
          studentId: us.user.id,
          name: `${us.user.firstName} ${us.user.lastName}`,
          courseId: us.schedule.course.id,
          course: us.schedule.course.name,
          batchId: us.schedule.period.id,
          batch: us.schedule.period.batchName,
          year: new Date(us.schedule.period.startAt).getFullYear(),
        };
      }
    });

    // 3. For each group, get fees, student_fee, course base price, payments, adjustments, and calculate balances
    const results = await Promise.all(
      Object.values(assessmentMap).map(async (entry) => {
        const fees = await prisma.fees.findMany({
          where: {
            courseId: entry.courseId,
            batchId: entry.batchId,
            isActive: true,
          },
        });

        const studentFees = await prisma.student_fee.findMany({
          where: {
            studentId: entry.studentId,
            courseId: entry.courseId,
            batchId: entry.batchId,
            deletedAt: null,
          },
        });

        const course = await prisma.course.findUnique({
          where: { id: entry.courseId },
          select: { price: true },
        });
        const courseBasePrice = course ? Number(course.price) : 0;

        const payments = await prisma.payments.findMany({
          where: {
            userId: entry.studentId,
            status: "paid",
            courseId: entry.courseId,
            academicPeriodId: entry.batchId,
          },
        });

        const adjustments = await prisma.adjustments.findMany({
          where: {
            userId: entry.studentId,
          },
        });

        const studentFeeTotal = studentFees.reduce((sum, sf) => {
          if (sf.type === "fee") return sum + Number(sf.amount);
          if (sf.type === "discount") return sum - Number(sf.amount);
          return sum;
        }, 0);

        const netAssessment =
          fees.reduce((sum, f) => sum + Number(f.price), 0) +
          courseBasePrice +
          studentFeeTotal -
          adjustments.reduce((sum, a) => sum + Number(a.amount), 0);
        const totalPayments = payments.reduce(
          (sum, p) => sum + Number(p.amount),
          0
        );
        const remainingBalance = netAssessment - totalPayments;

        return {
          studentId: entry.studentId,
          name: entry.name,
          course: entry.course,
          courseId: entry.courseId,
          batch: entry.batch,
          batchId: entry.batchId,
          year: entry.year,
          netAssessment,
          totalPayments,
          remainingBalance,
          studentFees,
        };
      })
    );

    res.json(results);
  } catch (error) {
    console.error("ListAssessments error:", error, error?.stack);
    res.status(500).json({ error: "Failed to list assessments." });
  }
};

// Returns all assessments for a student (array, grouped by course and batch)
export const getAllAssessmentsForStudent = async (req, res) => {
  const { studentId } = req.params;
  try {
    // 1. Get all user_schedules for this student (active only), including schedule, course, and period
    const userSchedules = await prisma.user_schedule.findMany({
      where: {
        userId: studentId,
        deletedAt: null,
      },
      include: {
        schedule: {
          include: {
            course: true,
            period: true,
          },
        },
        user: true,
      },
    });

    // 2. Group by course and batch (period)
    const assessmentMap = {};
    userSchedules.forEach((us) => {
      if (
        !us.user ||
        !us.schedule ||
        !us.schedule.course ||
        !us.schedule.period
      )
        return;
      const key = `${us.user.id}|${us.schedule.course.id}|${us.schedule.period.id}`;
      if (!assessmentMap[key]) {
        assessmentMap[key] = {
          studentId: us.user.id,
          name: `${us.user.firstName} ${us.user.lastName}`,
          courseId: us.schedule.course.id,
          course: us.schedule.course.name,
          batchId: us.schedule.period.id,
          batch: us.schedule.period.batchName,
          year: us.schedule.period.startAt
            ? new Date(us.schedule.period.startAt).getFullYear()
            : null,
        };
      }
    });

    // 3. For each group, get fees, student_fee, course base price, payments, adjustments, and calculate balances
    const results = await Promise.all(
      Object.values(assessmentMap).map(async (entry) => {
        const fees = await prisma.fees.findMany({
          where: {
            courseId: entry.courseId,
            batchId: entry.batchId,
            isActive: true,
          },
        });

        const studentFees = await prisma.student_fee.findMany({
          where: {
            studentId: entry.studentId,
            courseId: entry.courseId,
            batchId: entry.batchId,
            deletedAt: null,
          },
        });

        const course = await prisma.course.findUnique({
          where: { id: entry.courseId },
          select: { price: true },
        });
        const courseBasePrice = course ? Number(course.price) : 0;

        const payments = await prisma.payments.findMany({
          where: {
            userId: entry.studentId,
            status: "paid",
            courseId: entry.courseId,
            academicPeriodId: entry.batchId,
          },
        });

        const adjustments = await prisma.adjustments.findMany({
          where: {
            userId: entry.studentId,
          },
        });

        const studentFeeTotal = studentFees.reduce((sum, sf) => {
          if (sf.type === "fee") return sum + Number(sf.amount);
          if (sf.type === "discount") return sum - Number(sf.amount);
          return sum;
        }, 0);

        const netAssessment =
          fees.reduce((sum, f) => sum + Number(f.price), 0) +
          courseBasePrice +
          studentFeeTotal -
          adjustments.reduce((sum, a) => sum + Number(a.amount), 0);
        const totalPayments = payments.reduce(
          (sum, p) => sum + Number(p.amount),
          0
        );
        const remainingBalance = netAssessment - totalPayments;

        return {
          studentId: entry.studentId,
          name: entry.name,
          course: entry.course,
          courseId: entry.courseId,
          batch: entry.batch,
          batchId: entry.batchId,
          year: entry.year,
          netAssessment,
          totalPayments,
          remainingBalance,
          studentFees,
        };
      })
    );

    res.json(results);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Failed to fetch all assessments for student." });
  }
};

export default {
  getAssessmentByStudent,
  listAssessments,
  getAllAssessmentsForStudent,
};
