import express from "express";
import {
  createEnrollmentRequest,
  getEnrollmentRequests,
  trackEnrollment,
  updateEnrollmentPaymentProof,
  updateEnrollmentStatus
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
router.put("/enroll/:enrollmentId/status", updateEnrollmentStatus);

// Admin routes
router.get(
  "/requests",
  verifyToken,
  validateIsActiveUser,
  validateUserIsAdmin,
  getEnrollmentRequests
);

export { router };
