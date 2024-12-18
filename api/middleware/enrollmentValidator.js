import Joi from "joi";

const enrollmentSchema = Joi.object({
  firstName: Joi.string().required(),
  middleName: Joi.string().optional().allow(null, ""),
  lastName: Joi.string().required(),
  birthDate: Joi.date().required(),
  civilStatus: Joi.string().required(),
  address: Joi.string().required(),
  referredBy: Joi.string().required(),
  contactNumber: Joi.string().required(),
  altContactNumber: Joi.string().optional().allow(null, ""),
  preferredEmail: Joi.string().email().required(),
  altEmail: Joi.string().email().optional().allow(null, ""),
  motherName: Joi.string().optional().allow(null, ""),
  motherContact: Joi.string().optional().allow(null, ""),
  fatherName: Joi.string().optional().allow(null, ""),
  fatherContact: Joi.string().optional().allow(null, ""),
  guardianName: Joi.string().optional().allow(null, ""),
  guardianContact: Joi.string().optional().allow(null, ""),
  coursesToEnroll: Joi.string().required(),
});

export const validateEnrollment = (req, res, next) => {
  const { error } = enrollmentSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res
      .status(400)
      .json({
        error: true,
        message: error.details.map((detail) => detail.message).join(", "),
      });
  }

  next();
};
