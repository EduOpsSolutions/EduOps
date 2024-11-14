import express from "express";
const router = express.Router();

import { router as students } from "./student_routes.js";
import { router as auth } from "./auth_routes.js";

router.get("/", function (req, res, next) {
  res.json({
    error: false,
    message: "Active",
  });
});

router.use("/students", students);
router.use("/auth", auth);

export default router;
