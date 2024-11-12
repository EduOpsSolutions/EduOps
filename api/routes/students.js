const express = require("express");
const router = express.Router();
const {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
} = require("../controller/students_controller");
const {
  validateUpdateStudent,
  validateCreateStudent,
} = require("../middleware/studentValidator");

/* GET users listing. */
router.get("/", getAllStudents);
router.get("/:id", getStudentById);
router.post("/create/", validateCreateStudent, createStudent);
router.put("/:id", validateUpdateStudent, updateStudent);
router.delete("/delete/:id", deleteStudent);

module.exports = router;
