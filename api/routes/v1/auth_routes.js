import express from "express";
const router = express.Router();
import { login, register } from "../../controller/auth_controller.js";
import { validateLogin } from "../../middleware/authValidator.js";

router.post("/login", validateLogin, login);

router.post("/register", register);

export { router };
