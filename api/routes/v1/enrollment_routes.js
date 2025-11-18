import express from "express";
import {
  createEnrollmentRequest,
  getEnrollmentRequests,
  trackEnrollment,
  trackEnrollmentByUserEmail,
  updateEnrollmentPaymentProof,
  updateEnrollmentStatus,
  updateEnrollment,
  checkEmailExists,
  getStudentEnrollments,
} from "../../controller/enrollment_controller.js";
import { validateEnrollment } from "../../middleware/enrollmentValidator.js";
import { verifyToken } from "../../utils/verifyToken.js";
import {
  validateIsActiveUser,
  validateUserIsAdmin,
} from "../../middleware/authValidator.js";

const router = express.Router();

// Public routes
router.post("/enroll", validateEnrollment, createEnrollmentRequest);
router.post("/track", trackEnrollment);
router.patch("/payment-proof", updateEnrollmentPaymentProof);
router.put(
  "/enroll/:enrollmentId/status",
  verifyToken,
  validateIsActiveUser,
  validateUserIsAdmin,
  updateEnrollmentStatus
);

// Public endpoint to check if email is already used in an enrollment request
router.get("/check-email", checkEmailExists);

// Logged-in user route to track their enrollment
router.get(
  "/track/email/:email",
  verifyToken,
  validateIsActiveUser,
  trackEnrollmentByUserEmail
);

// Admin routes
router.get(
  "/requests",
  verifyToken,
  validateIsActiveUser,
  validateUserIsAdmin,
  getEnrollmentRequests
);

// Update all fields of an enrollment (admin)
router.put(
  "/enroll/:enrollmentId",
  verifyToken,
  validateIsActiveUser,
  validateUserIsAdmin,
  updateEnrollment
);

router.get(
  "/:studentId/enrollments",
  verifyToken,
  validateIsActiveUser,
  getStudentEnrollments
);

export { router };
