import Joi from "joi";

const loginSchema = Joi.object({
  email: Joi.string().email(),
  password: Joi.string().min(8).max(100),
});

export const validateLogin = (req, res, next) => {
  const { error } = loginSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res
      .status(400)
      .json({ error: true, message: "Invalid email or password" });
  }

  next();
};
