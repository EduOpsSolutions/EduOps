import express from "express";
const router = express.Router();

import {
  getStudentEnrollmentReport,
  getFinancialAssessmentReport,
  getGradeDistributionReport,
  getCourseEnrollmentStatistics,
  getTransactionHistoryReport,
  getFacultyTeachingLoadReport,
  getEnrollmentPeriodAnalysis,
  getOutstandingBalanceReport,
  getDocumentSubmissionStatus,
  getClassScheduleReport,
  getStudentLedgerSummary,
  getEnrollmentRequestsLog,
  getFeeStructureReport,
  getUserAccountActivity,
} from "../../controller/reports_controller.js";

import { validateUserIsAdmin } from "../../middleware/authValidator.js";
import { verifyToken } from "../../utils/verifyToken.js";

// All report routes require admin authentication
// Apply verifyToken and validateUserIsAdmin middleware to all routes

// Report 1: Student Enrollment Report
// Query params: periodId, program, yearLevel, status
router.get(
  "/student-enrollment",
  verifyToken,
  validateUserIsAdmin,
  getStudentEnrollmentReport
);

// Report 2: Financial Assessment Summary
// Query params: periodId, status, minBalance, maxBalance
router.get(
  "/financial-assessment",
  verifyToken,
  validateUserIsAdmin,
  getFinancialAssessmentReport
);

// Report 3: Grade Distribution Report
// Query params: periodId, courseId, gradeRange
router.get(
  "/grade-distribution",
  verifyToken,
  validateUserIsAdmin,
  getGradeDistributionReport
);

// Report 4: Course Enrollment Statistics
// Query params: periodId, courseId
router.get(
  "/course-enrollment-stats",
  verifyToken,
  validateUserIsAdmin,
  getCourseEnrollmentStatistics
);

// Report 5: Transaction History Report
// Query params: periodId, startDate, endDate, minAmount, maxAmount
router.get(
  "/transaction-history",
  verifyToken,
  validateUserIsAdmin,
  getTransactionHistoryReport
);

// Report 6: Faculty Teaching Load Report
// Query params: periodId, facultyId
router.get(
  "/faculty-teaching-load",
  verifyToken,
  validateUserIsAdmin,
  getFacultyTeachingLoadReport
);

// Report 8: Enrollment Period Analysis
// Query params: schoolYear
router.get(
  "/enrollment-period-analysis",
  verifyToken,
  validateUserIsAdmin,
  getEnrollmentPeriodAnalysis
);

// Report 9: Outstanding Balance Report
// Query params: periodId, minBalance
router.get(
  "/outstanding-balance",
  verifyToken,
  validateUserIsAdmin,
  getOutstandingBalanceReport
);

// Report 10: Document Submission Status
// Query params: status, studentId
router.get(
  "/document-submission-status",
  verifyToken,
  validateUserIsAdmin,
  getDocumentSubmissionStatus
);

// Report 11: Class Schedule Report
// Query params: periodId, courseId, days
router.get(
  "/class-schedule",
  verifyToken,
  validateUserIsAdmin,
  getClassScheduleReport
);

// Report 12: Student Ledger Summary
// Query params: studentId (required), periodId
router.get(
  "/student-ledger-summary",
  verifyToken,
  validateUserIsAdmin,
  getStudentLedgerSummary
);

// Report 13: Enrollment Requests Log
// Query params: status, startDate, endDate
router.get(
  "/enrollment-requests-log",
  verifyToken,
  validateUserIsAdmin,
  getEnrollmentRequestsLog
);

// Report 14: Fee Structure Report
// Query params: periodId, feeType
router.get(
  "/fee-structure",
  verifyToken,
  validateUserIsAdmin,
  getFeeStructureReport
);

// Report 15: User Account Activity
// Query params: role, status, startDate, endDate
router.get(
  "/user-account-activity",
  verifyToken,
  validateUserIsAdmin,
  getUserAccountActivity
);

export { router };
