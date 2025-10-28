import express from 'express';

import { router as users } from './user_routes.js';
import { router as auth } from './auth_routes.js';
import { router as enrollment } from './enrollment_routes.js';
import { router as upload } from './upload_routes.js';
import { router as courses } from './course_routes.js';
import { router as academicPeriods } from './academic_period_routes.js';
import { router as academicPeriodCourses } from './academic_period_courses_routes.js';
import { router as posts } from './post_routes.js';
import { router as schedules } from './schedule_routes.js';
import { router as ai } from './ai_routes.js';
import payments from './payment_routes.js';
import documents from './document_routes.js';
import { router as grades } from './grades_routes.js';
import { router as reports } from './reports_routes.js';
import { router as assessment } from './assessment_routes.js';
import { router as feeRoutes } from './fees_routes.js';
import { router as logs } from './logs_routes.js';
import { router as courseRequisites } from './course_requisites_routes.js';

const router = express.Router();
router.get('/', function (req, res) {
  res.json({
    error: false,
    message: 'Active',
  });
});

router.use('/users', users);
router.use('/auth', auth);
router.use('/enrollment', enrollment);
router.use('/upload', upload);
router.use('/courses', courses);
router.use('/academic-periods', academicPeriods);
router.use('/academic-period-courses', academicPeriodCourses);
router.use('/posts', posts);
router.use('/schedules', schedules);
router.use('/ai', ai);
router.use('/payments', payments);
router.use('/logs', logs);
router.use('/reports', reports);
router.use('/documents', documents);
router.use('/grades', grades);
router.use('/assessment', assessment);
router.use('/fees', feeRoutes);
router.use('/course-requisites', courseRequisites);

export default router;
