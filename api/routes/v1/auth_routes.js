import express from "express";
const router = express.Router();
import {
  login,
  register,
  forgotPassword,
  changePassword,
} from "../../controller/auth_controller.js";
import { validateLogin } from "../../middleware/authValidator.js";

router.post("/login", validateLogin, login);
router.post("/forgot-password", forgotPassword);
router.post("/register", register);
router.post("/change-password", changePassword);

export { router };
