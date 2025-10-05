import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getAllCourses = (isStudent) => {
  return prisma.course.findMany({
    where: {
      deletedAt: null,
      ...(isStudent ? { visibility: 'visible' } : {}),
    },
    // include: {
    //     adviser: {
    //         select: {
    //             id: true,
    //             firstName: true,
    //             middleName: true,
    //             lastName: true
    //         }
    //     }
    // }
  });
};

export const getCourseById = (id) => {
  return prisma.course.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      // adviser: {
      //     select: {
      //         id: true,
      //         firstName: true,
      //         lastName: true
      //     }
      // }
    },
  });
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
    data: { deletedAt: new Date() },
  });
};
