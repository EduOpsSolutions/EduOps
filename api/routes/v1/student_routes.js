import express from "express";
const router = express.Router();
import {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
} from "../../controller/student_controller.js";
import {
  validateUpdateStudent,
  validateCreateStudent,
} from "../../middleware/studentValidator.js";

import { verifyToken } from "../../utils/verifyToken.js";

/* GET users listing. */
router.get("/", verifyToken, getAllStudents);
router.get("/:id", verifyToken, getStudentById);
router.post("/create/", verifyToken, validateCreateStudent, createStudent);
router.put("/:id", verifyToken, validateUpdateStudent, updateStudent);
router.delete("/delete/:id", verifyToken, deleteStudent);

export { router };
