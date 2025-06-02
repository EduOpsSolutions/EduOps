import { signJWT, verifyJWT } from "../utils/jwt.js";
import dotenv from "dotenv";
dotenv.config();
import {
  getUserByEmail as getStudentByEmail,
  updateUserPassword,
} from "../model/user_model.js";
import { getUserByToken } from "../model/user_model.js";
import { sendEmail } from "../utils/mailer.js";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";
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

    if (data.status !== "active") {
      return res.status(401).json({
        error: true,
        message: `User is ${data.status}. Please contact the administrator.`,
      });
    }

    const payload = {
      data,
    };

    const token = await signJWT(payload);
    res.status(200).json(token);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function forgotPassword(req, res) {
  const { email } = req.body;
  const token = crypto.randomBytes(32).toString("hex");
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
  const html = `
        <h3>You requested a password reset</h3>
        <p>Click this <a href="${resetUrl}">link</a> to reset your password</p>
        <p>This link will expire in 1 hour</p>
        <p>If you didn't request this, please ignore this email</p>
      `;
  try {
    const isSent = await sendEmail(email, "Forgot Password", html);
    if (isSent) {
      res
        .status(200)
        .json({ error: false, message: "Reset link sent successfully" });
    } else {
      res.status(500).json({ error: true, message: "Error sending email" });
    }
  } catch (error) {
    res.status(500).json({ error: true, message: "Error sending email" });
  }
}

async function resetPassword(req, res) {
  const { token, password } = req.body;
  if (!token || !password) {
    return res
      .status(400)
      .json({ error: true, message: "Token and password are required" });
  }
  try {
    if (token && password) {
      const user = await getUserByToken(token);
      if (!user || user.error) {
        return res.status(401).json({ error: true, message: "User not found" });
      }
      if (
        user.data.resetTokenExpiry &&
        user.data.resetTokenExpiry < new Date()
      ) {
        return res.status(401).json({ error: true, message: "Token expired" });
      }
      if (user.data.resetToken !== token) {
        return res.status(401).json({ error: true, message: "Invalid token" });
      }

      const saltRounds = parseInt(process.env.BCRYPT_SALT) || 11;
      const hashedPassword = bcrypt.hashSync(password, saltRounds);
      const updated = await updateUserPassword(user.data.email, hashedPassword);
      if (updated) {
        res
          .status(200)
          .json({ error: false, message: "Password updated successfully" });
      }
    }
  } catch (error) {
    res.status(500).json({
      error: true,
      message: "Error resetting password",
      error_message: error.message,
      error_info: error,
    });
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

async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword, email } = req.body;
    const user = await getStudentByEmail(email);

    if (!user || user.error) {
      return res.status(401).json({
        error: true,
        message: "User not found",
      });
    }

    const isValidPassword = bcrypt.compareSync(
      currentPassword,
      user.data?.password
    );
    if (!isValidPassword) {
      return res.status(401).json({
        error: true,
        message: "Current password is incorrect",
      });
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    // Add a function in your user_model.js to update the password
    const updated = await updateUserPassword(email, hashedPassword);

    if (updated) {
      res.status(200).json({
        error: false,
        message: "Password updated successfully",
      });
    } else {
      res.status(500).json({
        error: true,
        message: "Failed to update password",
      });
    }
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
}

const requestResetPassword = async (req, res) => {
  const prisma = new PrismaClient();
  const { email } = req.body;
  console.log("requestResetPassword", email);
  try {
    const user = await getStudentByEmail(email);
    if (!user || user.error) {
      return res.status(401).json({ error: true, message: "User not found" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    await prisma.users.update({
      where: { email },
      data: {
        resetToken: token,
        resetTokenExpiry: new Date(Date.now() + 1 * 60 * 60 * 1000),
      },
    });
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    const html = `
        <h3>You requested a password reset</h3>
        <p>Click this <a href="${resetUrl}">link</a> to reset your password</p>
        <p>This link will expire in 1 hour</p>
        <p>If you didn't request this, please ignore this email</p>
      `;
    const isSent = await sendEmail(email, "Reset Password", html);
    if (isSent) {
      res
        .status(200)
        .json({ error: false, message: "Reset link sent successfully" });
    } else {
      res.status(500).json({ error: true, message: "Error sending email" });
    }
  } catch (error) {
    res.status(500).json({
      error: true,
      message: "Error resetting password",
      error_message: error.message,
      error_info: error,
    });
  }
};
export {
  login,
  register,
  forgotPassword,
  changePassword,
  resetPassword,
  requestResetPassword,
};
