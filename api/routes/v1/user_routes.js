import express from "express";
const router = express.Router();
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../../controller/user_controller.js";
import {
  validateUpdateUser,
  validateCreateUser,
} from "../../middleware/userValidator.js";

import { verifyToken } from "../../utils/verifyToken.js";

/* GET users listing. */
router.get("/:showDeleted?/:role?/:take?/:page?", verifyToken, getAllUsers);
router.get("/:id", verifyToken, getUserById);
router.post("/create/", verifyToken, validateCreateUser, createUser);
router.put("/:id", verifyToken, validateUpdateUser, updateUser);
router.delete("/:id", verifyToken, deleteUser);

export { router };
