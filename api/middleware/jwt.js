import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "secret-key");

const sign = async (req, res, next) => {
  try {
    const token = await new SignJWT(req.body)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(process.env.JWT_EXPIRATION_TIME)
      .sign(secret);
    res.json({ token });
  } catch (error) {
    next(error);
  }
};

const verify = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res
        .status(401)
        .json({ error: true, message: "No token provided" });
    }
    // Remove 'Bearer ' prefix if present
    const tokenWithoutBearer = token.startsWith("Bearer ")
      ? token.slice(7)
      : token;
    const { payload } = await jwtVerify(tokenWithoutBearer, secret);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ error: true, message: "Invalid token" });
  }
};

export default {
  sign,
  verify,
};
