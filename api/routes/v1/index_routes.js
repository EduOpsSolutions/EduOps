import express from "express";
const router = express.Router();

import students from "./students_routes";
import auth from "./auth_routes";

router.get("/", function (req, res, next) {
  res.json({
    error: false,
    message: "Active",
  });
});

router.use("/students", students);
router.use("/auth", auth);

export default router;
