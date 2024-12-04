import express from "express";
const router = express.Router();

import { router as users } from "./user_routes.js";
import { router as auth } from "./auth_routes.js";
import { router as enrollment } from "./enrollment_routes.js";

router.get("/", function (req, res, next) {
  res.json({
    error: false,
    message: "Active",
  });
});

router.use("/users", users);
router.use("/auth", auth);
router.use("/enrollment", enrollment);

export default router;
