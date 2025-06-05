import express from "express";


import { router as users } from "./user_routes.js";
import { router as auth } from "./auth_routes.js";
import { router as enrollment } from "./enrollment_routes.js";
import { router as file } from "./file_routes.js";
import { router as courses } from "./course_routes.js"
import { router as academicPeriods } from "./academic_period_routes.js";

const router = express.Router();
router.get("/", function (req, res) {
  res.json({
    error: false,
    message: "Active",
  });
});

router.use("/users", users);
router.use("/auth", auth);
router.use("/enrollment", enrollment);
router.use("/files", file);
router.use("/courses", courses);
router.use("/academic-periods", academicPeriods);

export default router;
