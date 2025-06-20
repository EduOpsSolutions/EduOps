import * as AcademicPeriodCourses from '../model/academic_period_courses.js';
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

        const courses = await AcademicPeriodCourses.getCoursesForPeriod(periodId);
        
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

        const period = await prisma.academic_period.findUnique({
            where: { 
                id: periodId,
                deletedAt: null
            }
        });

        if (!period) {
            return res.status(404).json({ error: 'Academic period not found' });
        }

        const course = await prisma.course.findUnique({
            where: { 
                id: courseId,
                deletedAt: null
            }
        });

        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        const existingCourses = await AcademicPeriodCourses.getCoursesForPeriod(periodId);
        const courseExists = existingCourses.some(pc => pc.courseId === courseId && !pc.deletedAt);
        
        if (courseExists) {
            return res.status(400).json({ error: 'This course is already added to this period' });
        }

        const periodCourse = await AcademicPeriodCourses.addCourseToPeriod(periodId, courseId);
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
        const periodCourse = await AcademicPeriodCourses.removeCourseFromPeriod(id);
        res.json({ message: 'Course removed from period', periodCourse });
    } catch (err) {
        console.error("Error removing course from period:", err);
        res.status(500).json({ error: 'Failed to remove course from period' });
    }
};