import express from "express";
const router = express.Router();
import {
  login,
  register,
  forgotPassword,
} from "../../controller/auth_controller.js";
import { validateLogin } from "../../middleware/authValidator.js";

router.post("/login", validateLogin, login);
router.post("/forgot-password", forgotPassword);
router.post("/register", register);

export { router };
