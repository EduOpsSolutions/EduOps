import Joi from "joi";

// Create User schema (password required)
const userCreateSchema = Joi.object({
  userId: Joi.string().min(1).max(100).optional(),
  firstName: Joi.string().min(2).trim().required(),
  lastName: Joi.string().min(2).trim().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(100).required(),
  role: Joi.string().valid("student", "teacher", "admin").default("student"),
  middleName: Joi.string().trim().optional().allow(null, ""),
  phoneNumber: Joi.string().optional(),
  birthmonth: Joi.number().integer().min(1).max(12).optional(),
  birthdate: Joi.number().integer().min(1).max(31).optional(),
  birthyear: Joi.number()
    .integer()
    .min(1900)
    .max(new Date().getFullYear())
    .optional(),
});

// Update User schema (password not allowed here; use reset/change endpoints)
const userUpdateSchema = Joi.object({
  firstName: Joi.string().min(2).trim().optional(),
  lastName: Joi.string().min(2).trim().optional(),
  email: Joi.string().email().optional(),
  role: Joi.string().valid("student", "teacher", "admin").optional(),
  status: Joi.string()
    .valid("active", "disabled", "suspended", "deleted")
    .optional(),
  deletedAt: Joi.date().optional().allow(null),
  profilePicLink: Joi.string().uri().optional().allow(null, ""),
  middleName: Joi.string().trim().optional().allow(null, ""),
  password: Joi.any().forbidden(),
});

// Middleware function
const validateUpdateUser = (req, res, next) => {
  const { error } = userUpdateSchema.validate(req.body, {
    abortEarly: false, // Return all errors, not just the first one
    stripUnknown: true, // Remove unknown fields
  });

  if (error) {
    return res.status(400).json({
      error: true,
      message: "Validation error",
      errors: error.details.map((err) => ({
        field: err.path[0],
        message: err.message,
      })),
    });
  }

  next();
};

const validateCreateUser = (req, res, next) => {
  const { error } = userCreateSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      error: true,
      message: "Validation error",
      errors: error.details.map((err) => ({
        field: err.path[0],
        message: err.message,
      })),
    });
  }

  next();
};

export { validateUpdateUser, validateCreateUser };
