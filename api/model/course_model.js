import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getAllCourses = (isStudent) => {
    return prisma.course.findMany({
        where: {
            deletedAt: null,
            ...(isStudent ? { visibility: 'visible' } : {})
        }
    });
};

export const getCourseById = (id) => {
    return prisma.course.findUnique({ where: { id } });
};

export const createCourse = (data) => {
    return prisma.course.create({ data });
};

export const updateCourse = (id, data) => {
    return prisma.course.update({ where: { id }, data });
};

export const deleteCourse = (id) => {
    return prisma.course.update({
        where: { id },
        data: { deletedAt: new Date() }
    });
};