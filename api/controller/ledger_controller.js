import { PrismaClient } from '@prisma/client';
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
    orderBy: { createdAt: 'desc' },
  });

  // Deduplicate by student, keeping the latest schedule
  const studentMap = {};
  userSchedules.forEach(us => {
    if (!us.user || !us.schedule || !us.schedule.course || !us.schedule.period) return;
    const studentId = us.user.id;
    // Only keep the first (latest by createdAt due to orderBy)
    if (!studentMap[studentId]) {
      studentMap[studentId] = {
        studentId: us.user.id,
        name: `${us.user.firstName} ${us.user.lastName}`,
        course: us.schedule.course.name,
        batch: us.schedule.period.batchName,
        year: us.schedule.period.startAt ? new Date(us.schedule.period.startAt).getFullYear() : null,
      };
    }
  });

  const result = Object.values(studentMap);
  res.json(result);
};