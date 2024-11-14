import { SignJWT, jwtVerify, jwtDecrypt } from "jose";
const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export const signJWT = async (payload) => {
  console.log("PAYLOADKOBEH", payload);
  try {
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(process.env.JWT_EXPIRATION_TIME)
      .sign(secret);
    return {
      token,
      expiresIn: process.env.JWT_EXPIRATION_TIME,
      signedAt: new Date().toLocaleString(),
    };
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

// export const decryptJWT = async (token) => {
//   return await jwtDecrypt(token, secret);
// };

// export const decryptJWT = async (token) => {
//   //only for dev env
//   try {
//     const base64Payload = token.split(".")[1];
//     const payload = Buffer.from(base64Payload, "base64");
//     return JSON.parse(payload.toString());
//   } catch (error) {
//     throw new Error("Error decrypting JWT: " + error.message);
//   }
// };
