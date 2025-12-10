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
import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import bcrypt from "bcrypt";
import { createLog, logSecurityEvent } from "../utils/logger.js";
import { MODULE_TYPES } from "../constants/module_types.js";

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
          moduleType: MODULE_TYPES.AUTH,
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
    const changePassword = data.changePassword || false;
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
    res.status(200).json({
      token,
      error: false,
      message: "Login successful",
      changePassword,
    });
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

  // Generate default password using same format as account creation
  // Format: lastname(no spaces) + first 2 letters of firstname + birthyear
  const cleanLastName = user.lastName.replace(/\s+/g, "").toLowerCase();
  const firstNamePart =
    user.firstName.length >= 2
      ? user.firstName.substring(0, 2).toLowerCase()
      : user.firstName.substring(0, 1).toLowerCase();
  const password = `${cleanLastName}${firstNamePart}${user.birthyear}`;

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
    "Password Reset - Sprach Institut",
    "",
    `
    <div style="font-family: Arial, sans-serif; background: #f7f7f7; padding: 32px;">
      <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.07); overflow: hidden;">
        <div style="background: #890E07; color: #fff; padding: 24px 32px;">
          <h1 style="margin: 0; font-size: 2rem;">Password Reset</h1>
        </div>
        <div style="padding: 32px;">
          <h2 style="color: #890E07; margin-top: 0;">Your password has been reset</h2>
          <p style="font-size: 1.1rem; color: #333; line-height: 1.6;">
            An administrator has reset your account password to the default password.
          </p>
          <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 16px; margin: 24px 0;">
            <p style="margin: 8px 0; font-size: 0.95rem; color: #856404;">
              <strong>Password Format:</strong>
            </p>
            <p style="margin: 8px 0; font-size: 0.95rem; color: #856404;">
              &lt;Last Name (no spaces)&gt;&lt;First Name (first 2 letters)&gt;&lt;Birth Year&gt;
            </p>
            <p style="margin: 8px 0; font-size: 0.85rem; color: #856404; font-style: italic;">
              All in lowercase. Example: If your name is John Smith and you were born in 2000, your password would be: smithjo2000
            </p>
          </div>
          <div style="background: #d4edda; border-left: 4px solid #28a745; padding: 16px; margin: 24px 0;">
            <p style="margin: 0; font-size: 0.95rem; color: #155724;">
              <strong>Important:</strong> You will be required to change your password upon your next login for security purposes.
            </p>
          </div>
          <hr style="margin: 32px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #555; font-size: 0.9rem;">
            If you did not request this password reset, please contact the administrator immediately.
          </p>
        </div>
        <div style="background: #f1f1f1; color: #888; text-align: center; padding: 16px 0; font-size: 0.9rem;">
          &copy; ${new Date().getFullYear()} Sprach Institut. All rights reserved.
        </div>
      </div>
    </div>`
  );
  if (updated) {
    res.status(200).json({
      error: false,
      message: "Password reset to default successfully",
    });
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
    // TODO: Implement registration logic
    // This function needs to:
    // 1. Extract user data from req.body
    // 2. Validate the data
    // 3. Hash the password
    // 4. Create the user in the database
    // 5. Generate a token
    // 6. Return the token

    res.status(501).json({
      error: true,
      message: "Registration not implemented yet",
    });
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
      return res.status(400).json({
        error: true,
        message: "New password cannot be the same as the old password",
      });
    }

    if (!isValidPassword) {
      return res.status(400).json({
        error: true,
        message: "Current password is incorrect",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, bcryptSalt);

    console.log("hashedPassword", hashedPassword);
    // Update the password and set changePassword to false
    const updated = await prisma.users.update({
      where: { email },
      data: {
        password: hashedPassword,
        changePassword: false,
      },
    });

    if (updated) {
      await logSecurityEvent(
        "Password Change for User: " + user.data.email,
        user.data.userId,
        MODULE_TYPES.AUTH,
        `Password changed for user: ${user.data.email} via system change password requirement.`
      );
      return res.status(200).json({
        error: false,
        message: "Password updated successfully",
      });
    }
    return res.status(500).json({
      error: true,
      message: "Failed to update password",
    });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
}

async function forcedChangePassword(req, res) {
  try {
    const { oldPassword, newPassword, email } = req.body;
    console.log("forcedChangePassword - Called for email:", email);

    // Validate input
    if (!oldPassword || !newPassword || !email) {
      console.log("forcedChangePassword - Validation failed: missing fields");
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

    // Verify the old password first (MUST use await with bcrypt.compare)
    const isValidPassword = await bcrypt.compare(
      oldPassword,
      user.data?.password
    );
    console.log("forcedChangePassword - Password valid:", isValidPassword);

    if (!isValidPassword) {
      console.log("forcedChangePassword - Invalid password");
      return res.status(400).json({
        error: true,
        message: "Current password is incorrect",
      });
    }

    // Check if new password is the same as old (MUST use await with bcrypt.compare)
    const isTheSamePassword = await bcrypt.compare(
      newPassword,
      user.data?.password
    );

    if (isTheSamePassword) {
      return res.status(400).json({
        error: true,
        message: "New password cannot be the same as the old password",
      });
    }

    // Verify user actually needs to change password (optional security check)
    if (user.data.changePassword !== true) {
      return res.status(400).json({
        error: true,
        message: "Password change not required for this account",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, bcryptSalt);

    // Update the password and set changePassword to false
    const updated = await prisma.users.update({
      where: { email },
      data: {
        password: hashedPassword,
        changePassword: false,
      },
    });

    if (updated) {
      console.log(
        "forcedChangePassword - Password updated successfully for:",
        email
      );
      console.log(
        "forcedChangePassword - changePassword flag set to:",
        updated.changePassword
      );
      await logSecurityEvent(
        "Forced Password Change - " + user.data.email,
        user.data.userId,
        MODULE_TYPES.AUTH,
        `Password changed for user: ${user.data.email} via forced password change requirement.`
      );
      return res.status(200).json({
        error: false,
        message: "Password updated successfully",
      });
    } else {
      console.log("forcedChangePassword - Update returned null/undefined");
      return res.status(500).json({
        error: true,
        message: "Failed to update password",
      });
    }
  } catch (error) {
    console.log("forcedChangePassword - Error:", error.message);
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
    console.log("resetUrl", resetUrl);
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
        MODULE_TYPES.AUTH,
        `Reset password request sent to email: ${email}`
      );
      res
        .status(200)
        .json({ error: false, message: "Reset link sent successfully" });
    } else {
      await logSecurityEvent(
        "Reset Password Request Error",
        updatedUser.userId,
        MODULE_TYPES.AUTH,
        `Error sending email to ${email}`
      );
      res.status(500).json({ error: true, message: "Error sending email" });
    }
  } catch (error) {
    await logSecurityEvent(
      "Reset Password Request Error",
      null,
      MODULE_TYPES.AUTH,
      `Error resetting password: ${error.message}`
    );
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
  forcedChangePassword,
};
