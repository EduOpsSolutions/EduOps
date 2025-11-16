import pkg from "@prisma/client";
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

export const getStudentsWithOngoingPeriod = async (req, res) => {
  // Get all user_schedules (active only), including user, schedule, course, and period
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
    orderBy: { createdAt: "desc" },
  });

  // Deduplicate by student, keeping the latest schedule
  const studentMap = {};
  userSchedules.forEach((us) => {
    if (!us.user || !us.schedule || !us.schedule.course || !us.schedule.period)
      return;
    const studentId = us.user.id;
    // Only keep the first (latest by createdAt due to orderBy)
    if (!studentMap[studentId]) {
      studentMap[studentId] = {
        studentId: us.user.id,
        userId: us.user.userId,
        name: `${us.user.firstName} ${us.user.lastName}`,
        course: us.schedule.course.name,
        batch: us.schedule.period.batchName,
        year: us.schedule.period.startAt
          ? new Date(us.schedule.period.startAt).getFullYear()
          : null,
      };
    }
  });

  const result = Object.values(studentMap);
  res.json(result);
};

// Returns an itemized ledger for a student (fees, student fees/discounts, payments)
export const getStudentLedger = async (req, res) => {
  const { studentId } = req.params;
  try {
    // 1. Get all user_schedules for this student (active only)
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

    // 2. For each schedule, get course fees and student fees
    let ledgerRows = [];
    for (const us of userSchedules) {
      if (!us.schedule || !us.schedule.course || !us.schedule.period) continue;
      const course = us.schedule.course;
      const batch = us.schedule.period;
      // 1. Base course fee (debit)
      if (course.price && Number(course.price) > 0) {
        ledgerRows.push({
          date: us.createdAt, // or course.createdAt if you want
          description: `Course Fee (${course.name})`,
          debit: Number(course.price),
          credit: 0,
          type: "Course Fee",
          remarks: "",
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
          });
        } else if (sf.type === "discount") {
          ledgerRows.push({
            date: sf.createdAt,
            description: sf.name,
            debit: 0,
            credit: Number(sf.amount),
            type: "Discount",
            remarks: "",
          });
        }
      });
    }

    // 3. Payments (credits)
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
        orNumber: payment.orNumber || payment.referenceNumber || "",
      });
    });

    // 4. Sort by date ascending
    ledgerRows.sort((a, b) => new Date(a.date) - new Date(b.date));

    // 5. Add running balance
    let balance = 0;
    ledgerRows = ledgerRows.map((row) => {
      balance += (row.debit || 0) - (row.credit || 0);
      return { ...row, balance };
    });

    res.json(ledgerRows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch student ledger." });
  }
};

export default {
  getStudentsWithOngoingPeriod,
  getStudentLedger,
};
