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
import { createLog, logSecurityEvent, ModuleTypes } from "../utils/logger.js";

const bcryptSalt = parseInt(process.env.BCRYPT_SALT) || 11;
const prisma = new PrismaClient();
// Inside your login route handler
async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await getStudentByEmail(email);
    if (!user || user.error) {
      return res
        .status(401)
        .json({ error: true, message: "Incorrect email or password" });
    }

    try {
      const isValidPassword = bcrypt.compareSync(password, user.data?.password);
      if (!isValidPassword) {
        createLog({
          title: "Authentication Error - Login - Incorrect email or password",
          content: `Attempted login with email: ${email}`,
          moduleType: "AUTH",
          type: "security_log",
        });
        return res.status(401).json({
          error: true,
          message: "Incorrect email or password",
        });
      }
    } catch (bcryptError) {
      console.log(password, user.password);
      console.error("Password comparison error:", bcryptError);
      return res.status(500).json({
        error: true,
        message: "Something went wrong, please try again later.",
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
    res.cookie("token", token, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === "production",
      maxAge: 10, //10 seconds
      // maxAge: 24 * 60 * 60 * 1000,
    });
    res.status(200).json({ token, error: false, message: "Login successful" });
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

async function adminResetPassword(req, res) {
  const { id } = req.body;
  if (!id) {
    return res
      .status(400)
      .json({ error: true, message: "User ID is required" });
  }
  const user = await prisma.users.findUnique({
    where: {
      id,
    },
  });
  if (!user) {
    return res.status(401).json({ error: true, message: "User not found" });
  }

  const password = `${user.firstName.slice(0, 3).toLowerCase()}${user.lastName
    .slice(0, 2)
    .toLowerCase()}${user.birthmonth}${user.birthdate}${user.birthyear}`;
  const hashedPassword = bcrypt.hashSync(password, bcryptSalt);
  const updated = await prisma.users.update({
    where: {
      id,
    },
    data: {
      password: hashedPassword,
      changePassword: true,
    },
  });
  await sendEmail(
    user.email,
    "Password Reset",
    "",
    `
    <h3>Your account password has been reset</h3>
    <p>Please use the following instructions to login. Your account password is "&lt;First Name (first 3 letters)&gt;&lt;Last Name (first 2 letters)&gt;&lt;Birthmonth&gt;&lt;Birthdate&gt;&lt;Birthyear&gt;" All in lowercase. You might be prompted to change your password on your next login.</p>
    <p>If you didn't request this, please ignore this email</p>`
  );
  if (updated) {
    res
      .status(200)
      .json({ error: false, message: "Password updated successfully" });
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
      if (user.error) {
        return res.status(401).json({ error: true, message: user.message });
      }
      if (!user) {
        return res.status(401).json({ error: true, message: "User not found" });
      }
      if (!user.data.resetToken) {
        return res
          .status(401)
          .json({ error: true, message: "Invalid or expired token" });
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
    const { oldPassword, newPassword, email } = req.body;
    const token = req.headers.authorization.split(" ")[1];
    const decoded = await verifyJWT(token);
    if (decoded.payload.data.email !== email)
      return res.status(401).json({ error: true, message: "Unauthorized" });

    // Validate input
    if (!oldPassword || !newPassword || !email) {
      return res.status(400).json({
        error: true,
        message: "Old password, new password, and email are required",
      });
    }

    const user = await getStudentByEmail(email);

    if (!user || user.error) {
      return res.status(404).json({
        error: true,
        message: "User not found",
      });
    }
    if (user.data.email !== decoded.payload.data.email) {
      return res.status(401).json({
        error: true,
        message: "Unauthorized",
      });
    }

    const isValidPassword = await bcrypt.compare(
      oldPassword,
      user.data?.password
    );

    const isTheSamePassword = await bcrypt.compare(
      newPassword,
      user.data?.password
    );
    if (isTheSamePassword) {
      return res.status(401).json({
        error: true,
        message: "New password cannot be the same as the old password",
      });
    }

    if (!isValidPassword) {
      return res.status(401).json({
        error: true,
        message: "Current password is incorrect",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, bcryptSalt);

    console.log("hashedPassword", hashedPassword);
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
      return res.status(200).json({ error: true, message: "User not found" });
    }

    const token = await signJWT({ email });
    console.log("token", token);
    const updatedUser = await prisma.users.update({
      where: { email },
      data: {
        resetToken: token.token,
        resetTokenExpiry: new Date(Date.now() + 30 * 60 * 1000),
      },
      select: {
        id: true,
        userId: true,
        email: true,
      },
    });
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token.token}`;
    const html = `
        <h3>You requested a password reset</h3>
        <p>Click this <a href="${resetUrl}">link</a> to reset your password</p>
        <p>This link will expire in 30 minutes</p>
        <p>If you didn't request this, please ignore this email</p>
      `;
    const isSent = await sendEmail(email, "Reset Password", "", html);
    if (isSent) {
      await logSecurityEvent(
        "Reset Password Request",
        updatedUser.userId,
        "Reset password request sent to email: " + email
      );
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
  adminResetPassword,
};
