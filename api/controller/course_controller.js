import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getCourses = async (req, res) => {
    try {
        const isStudent = req.user?.role === 'student';
        const courses = await prisma.course.findMany({
            where: {
                deletedAt: null,
                ...(isStudent ? { visibility: 'visible' } : {}),
            },
        });
        res.json(courses);
    } catch (err) {
        res.status(500).json({ error: 'Failed to get courses' });
    }
};

export const getCourse = async (req, res) => {
    try {
        const course = await prisma.course.findUnique({
            where: { id: req.params.id },
            select: {
                id: true,
                name: true,
                price: true,
                // adviser: {
                //     select: {
                //         id: true,
                //         firstName: true,
                //         lastName: true
                //     }
                // }
            },
        });
        if (!course) return res.status(404).json({ error: 'Course Not found'});
        res.json(course);
    } catch (err) {
        res.status(500).json({ error: 'Failed to get course'});
    }
};

export const createCourse = async (req, res) => {
    try {
        console.log("Incoming body:", req.body);
        const data = { ...req.body };
        const course = await prisma.course.create({ data });
        res.status(201).json(course);
    } catch (err) {
        console.error("Create course error:", err);
        res.status(500).json({ error: 'Failed to create course'});
    }
};

export const updateCourse = async (req, res) => {
    try {
        const course = await prisma.course.update({ where: { id: req.params.id }, data: req.body });
        res.json(course);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update course'});
    }
}

export const deleteCourse = async (req, res) => {
    try {
        const course = await prisma.course.update({
            where: { id: req.params.id },
            data: { deletedAt: new Date() },
        });
        res.json({ message: 'Course deleted', course});
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete course'});
    }
};

export default {
    getCourses,
    getCourse,
    createCourse,
    updateCourse,
    deleteCourse
};