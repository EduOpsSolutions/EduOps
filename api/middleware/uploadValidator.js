const validateUpload = (req, res, next) => {
  const { error } = uploadSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });
};

export default validateUpload;
