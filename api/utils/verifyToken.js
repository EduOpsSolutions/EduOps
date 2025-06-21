import { verifyJWT } from "./jwt.js";

export const verifyToken = async (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ error: true, message: "Unauthorized" });
  }

  const token = req.headers.authorization?.split(" ")[1];
  try {
    const { payload, expired } = await verifyJWT(token);
    if (!payload && !expired) {
      return res.status(401).json({ error: true, message: "Invalid token" });
    }
    if (expired) {
      return res.status(401).json({ error: true, message: "Token expired" });
    }

    req.user = payload;
    next();
  } catch (error) {
    //log system error here
    return res.status(500).json({
      error: true,
      message: "Internal server error. Failed to verify token",
    });
  }
};
