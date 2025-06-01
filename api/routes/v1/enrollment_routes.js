import express from "express";
import { createEnrollmentRequest } from "../../controller/enrollment_controller.js";
import { validateEnrollment } from "../../middleware/enrollmentValidator.js";

const router = express.Router();

router.post("/enroll", validateEnrollment, createEnrollmentRequest);

export { router };
