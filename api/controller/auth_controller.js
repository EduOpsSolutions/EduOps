import { signJWT, verifyJWT } from "../utils/jwt";
import { getUserByEmail as getStudentByEmail } from "../models/students/students_model";
import { getUserByEmail as getTeacherByEmail } from "../models/teachers/teachers_model";
import { getUserByEmail as getAdminByEmail } from "../models/admins/admins_model";

// Inside your login route handler
async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await getStudentByEmail(email);
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const token = await signJWT(payload);
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function register(req, res) {
  try {
    const token = await signJWT(payload);
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  login,
  register,
};
