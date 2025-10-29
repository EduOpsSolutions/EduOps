import uploadSchema from "../schemas/uploadSchema.js";
import { logError, ModuleTypes } from "../utils/logger.js";

const validateUpload = async (req, res, next) => {
  const { error, value } = uploadSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });
  if (error) {
    await logError(
      "Upload Validator - Validation Error",
      error,
      req.user?.data?.id || null,
      ModuleTypes.CONTENTS
    );
    return res.status(400).json({ errors: error.details });
  }
  req.body = value;
  next();
};

export default validateUpload;
