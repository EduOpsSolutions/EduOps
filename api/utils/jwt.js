import { SignJWT, jwtVerify } from "jose";
const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export const signJWT = async (payload) => {
  try {
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30m")
      .sign(secret);
    return token;
  } catch (error) {
    throw new Error("Error signing JWT: " + error.message);
  }
};

export const verifyJWT = async (token) => {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    if (error.code === "ERR_JWT_EXPIRED") {
      return { expired: true }; // or return whatever you want for expired tokens
    }
    console.error("Error verifying JWT: " + error.message);
    return null;
  }
};

export const decryptJWT = async (token) => {
  //only for dev env
  try {
    const base64Payload = token.split(".")[1];
    const payload = Buffer.from(base64Payload, "base64");
    return JSON.parse(payload.toString());
  } catch (error) {
    throw new Error("Error decrypting JWT: " + error.message);
  }
};
