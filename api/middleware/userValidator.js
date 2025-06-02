import Joi from "joi";

// Define the validation schema
const userSchema = Joi.object({
  userId: Joi.string().min(1).max(100),
  firstName: Joi.string().min(2).trim(),
  lastName: Joi.string().min(2).trim(),
  email: Joi.string().email(),
  password: Joi.string().min(8).max(100),
  role: Joi.string().valid("student", "teacher", "admin"),
}).min(1); // Require at least one field to be present

// Middleware function
const validateUpdateUser = (req, res, next) => {
  const { error } = userSchema.validate(req.body, {
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
  const { error } = userSchema.validate(req.body, {
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
