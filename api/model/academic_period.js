import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();


export const getAllAcademicPeriods = () => {
    return prisma.academic_period.findMany({
        where: {
            deletedAt: null
        }
    });
}

export const getAcademicPeriodById = (id) => {
    return prisma.academic_period.findUnique({
        where: { id }
    });
}

export const createAcademicPeriod = (data) => {
    return prisma.academic_period.create({ data });
}  

export const updateAcademicPeriod = (id, data) => {
    return prisma.academic_period.update({
        where: { id },
        data
    });
}

export const deleteAcademicPeriod = (id) => {
    return prisma.academic_period.update({
        where: { id },
        data: { deletedAt: new Date() }
    });
}

export const getActiveAcademicPeriod = () => {
    return prisma.academic_period.findMany({
        where: {
            deletedAt: null,
        }
    });
}