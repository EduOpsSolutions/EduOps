import express from "express";
const router = express.Router();
import {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
} from "../../controller/students_controller";
import {
  validateUpdateStudent,
  validateCreateStudent,
} from "../../middleware/studentValidator";

/* GET users listing. */
router.get("/", getAllStudents);
router.get("/:id", getStudentById);
router.post("/create/", validateCreateStudent, createStudent);
router.put("/:id", validateUpdateStudent, updateStudent);
router.delete("/delete/:id", deleteStudent);

export default router;
