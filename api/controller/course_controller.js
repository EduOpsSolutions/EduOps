import * as CourseModel from '../model/course_model.js';

export const getCourses = async (req, res) => {
    try {
        const isStudent = req.user?.role === 'student';
        const courses = await CourseModel.getAllCourses(isStudent);
        res.json(courses);
    } catch (err) {
        res.status(500).json({ error: 'Failed to get courses' });
    }
};

export const getCourse = async (req, res) => {
    try {
        const course = await CourseModel.getCourseById(req.params.id);
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
        const course = await CourseModel.createCourse(data);
        res.status(201).json(course);
    } catch (err) {
        console.error("Create course error:", err);
        res.status(500).json({ error: 'Failed to create course'});
    }
};

export const updateCourse = async (req, res) => {
    try {
        const course = await CourseModel.updateCourse(req.params.id, req.body);
        res.json(course);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update course'});
    }
}

export const deleteCourse = async (req, res) => {
    try {
        const course = await CourseModel.deleteCourse(req.params.id);
        res.json({ message: 'Course deleted', course});
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete course'});
    }
};