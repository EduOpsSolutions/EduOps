import { SignJWT, jwtVerify } from 'jose';
import { createSecretKey } from 'crypto';

if (!process.env.JWT_SECRET) {
  throw new Error(
    'JWT_SECRET environment variable is not set. Please set it in your .env file.'
  );
}

if (!process.env.JWT_EXPIRATION_TIME) {
  throw new Error(
    'JWT_EXPIRATION_TIME environment variable is not set. Please set it in your .env file.'
  );
}

const secret = createSecretKey(process.env.JWT_SECRET, 'utf-8');

export const signJWT = async (payload) => {
  console.log('PAYLOADKOBEH', payload);
  try {
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(process.env.JWT_EXPIRATION_TIME)
      .sign(secret);
    return {
      token,
      expiresIn: process.env.JWT_EXPIRATION_TIME,
      signedAt: new Date().toLocaleString(),
    };
  } catch (error) {
    throw new Error('Error signing JWT: ' + error.message);
  }
};

export const verifyJWT = async (token) => {
  try {
    if (!token) {
      console.error('No token provided for verification');
      return null;
    }

    if (!secret) {
      console.error('JWT secret is not properly initialized');
      return null;
    }

    const { payload } = await jwtVerify(token, secret);
    return { payload };
  } catch (error) {
    if (error.code === 'ERR_JWT_EXPIRED') {
      console.log('Token has expired');
      return { expired: true };
    }

    console.error('JWT Verification Error:', {
      code: error.code,
      message: error.message,
      token: token.substring(0, 20) + '...', // Log only first 20 chars for security
    });

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
