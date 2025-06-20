import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getCoursesForPeriod = (academicperiodId) => {
    return prisma.academic_period_courses.findMany({
        where: {
            academicperiodId: academicperiodId,
            deletedAt: null,
            course: {
                deletedAt: null
            }
        },
        include: {
            course: {
                select: {
                    name: true,
                    schedule: true,
                    maxNumber: true
                }
            }
        }
    });
};

export const addCourseToPeriod = async (academicperiodId, courseId) => {
    const period = await prisma.academic_period.findFirst({
        where: {
            id: academicperiodId,
            deletedAt: null
        }
    });

    if (!period) {
        throw new Error('Academic period not found or has been deleted');
    }

    const course = await prisma.course.findFirst({
        where: {
            id: courseId,
            deletedAt: null
        }
    });

    if (!course) {
        throw new Error('Course not found or has been deleted');
    }

    const existingEntry = await prisma.academic_period_courses.findFirst({
        where: {
            academicperiodId,
            courseId,
            deletedAt: null
        }
    });

    if (existingEntry) {
        throw new Error('Course is already added to this period');
    }

    return prisma.academic_period_courses.create({
        data: {
            academicperiodId,
            courseId
        },
        include: {
            course: true,
            academicPeriods: true
        }
    });
};

export const removeCourseFromPeriod = (id) => {
    return prisma.academic_period_courses.update({
        where: { id },
        data: { deletedAt: new Date() }
    });
};


