import uploadSchema from '../schemas/uploadSchema.js';

const validateUpload = (req, res, next) => {
  const { error, value } = uploadSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });
  if (error) {
    return res.status(400).json({ errors: error.details });
  }
  req.body = value;
  next();
};

export default validateUpload;
