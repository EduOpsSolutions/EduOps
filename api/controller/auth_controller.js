import { signJWT, verifyJWT } from "../utils/jwt.js";
import { getUserByEmail as getStudentByEmail } from "../model/student_model.js";
import { getUserByEmail as getTeacherByEmail } from "../model/teacher_model.js";
import { getUserByEmail as getAdminByEmail } from "../model/admin_model.js";
import bcrypt from "bcrypt";
// Inside your login route handler
async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await getStudentByEmail(email);
    if (!user || user.error) {
      return res
        .status(401)
        .json({ error: true, message: "Account does not exist" });
    }

    try {
      const isValidPassword = bcrypt.compareSync(password, user.data?.password);
      if (!isValidPassword) {
        return res.status(401).json({
          error: true,
          message: "Invalid password",
        });
      }
    } catch (bcryptError) {
      console.log(password, user.password);
      console.error("Password comparison error:", bcryptError);
      return res.status(500).json({
        error: true,
        message: "Error validating password",
      });
    }
    let { data } = user;
    delete data.password;

    const payload = {
      data,
    };

    const token = await signJWT(payload);
    res.status(200).json(token);
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

export { login, register };
