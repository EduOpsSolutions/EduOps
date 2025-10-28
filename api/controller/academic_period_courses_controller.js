import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getCoursesForPeriod = async (req, res) => {
    try {
        const { periodId } = req.params;
        if (!periodId) {
            return res.status(400).json({ error: 'Period ID is required' });
        }

        const periodExists = await prisma.academic_period.findFirst({
            where: {
                id: periodId,
                deletedAt: null
            }
        });
        if (!periodExists) {
            return res.status(404).json({ error: 'Academic period not found' });
        }

        const courses = await prisma.academic_period_courses.findMany({
            where: {
                academicperiodId: periodId,
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
        res.json(courses);
    } catch (err) {
        console.error("Error fetching courses for period:", err);
        res.status(500).json({ error: 'Failed to fetch courses for period' });
    }
};

export const addCourseToPeriod = async (req, res) => {
    try {
        const { periodId } = req.params;
        const { courseId } = req.body;

        if (!periodId) {
            return res.status(400).json({ error: 'Period ID is required' });
        }
        if (!courseId) {
            return res.status(400).json({ error: 'Course ID is required' });
        }

        const period = await prisma.academic_period.findFirst({
            where: {
                id: periodId,
                deletedAt: null
            }
        });
        if (!period) {
            return res.status(404).json({ error: 'Academic period not found' });
        }

        const course = await prisma.course.findFirst({
            where: {
                id: courseId,
                deletedAt: null
            }
        });
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        const existingEntry = await prisma.academic_period_courses.findFirst({
            where: {
                academicperiodId: periodId,
                courseId,
                deletedAt: null
            }
        });
        if (existingEntry) {
            return res.status(400).json({ error: 'This course is already added to this period' });
        }

        const periodCourse = await prisma.academic_period_courses.create({
            data: {
                academicperiodId: periodId,
                courseId
            },
            include: {
                course: true,
                academicPeriods: true
            }
        });
        res.status(201).json(periodCourse);
    } catch (err) {
        console.error("Error adding course to period:", err);
        if (err.code === 'P2002') {
            res.status(400).json({ error: 'This course is already added to this period' });
        } else if (err.code === 'P2003') {
            res.status(404).json({ error: 'Period or course not found' });
        } else {
            res.status(500).json({ error: 'Failed to add course to period' });
        }
    }
};

export const removeCourseFromPeriod = async (req, res) => {
    try {
        const { id } = req.params;
        const periodCourse = await prisma.academic_period_courses.update({
            where: { id },
            data: { deletedAt: new Date() }
        });
        res.json({ message: 'Course removed from period', periodCourse });
    } catch (err) {
        console.error("Error removing course from period:", err);
        res.status(500).json({ error: 'Failed to remove course from period' });
    }
};