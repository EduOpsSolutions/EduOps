import Cookies from 'js-cookie';
import { decodeJwt } from 'jose';

/**
 * Gets and decodes a JWT token from cookies
 * @param {string} cookieName - The name of the cookie containing the token
 * @returns {null | string} The token or null if not found/invalid
 */
export const getCookieItem = (cookieName) => {
  try {
    const token = Cookies.get(cookieName);
    if (!token) return null;
    return token;
  } catch (error) {
    console.error('Error obtaining token:', error);
    return null;
  }
};

/**
 * Decodes a JWT token payload
 * @param {string} token - The JWT token to decode
 * @returns {object|null} The decoded token payload or null if invalid
 */
export const decodeToken = (token) => {
  if (!token) return null;

  const decodedToken = decodeJwt(token);

  try {
    return decodedToken;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Sets a JWT token in cookies
 * @param {string} token - The JWT token to store
 */
export const setTokenCookie = async (token) => {
  const decodedToken = await decodeToken(token);
  console.log('Decoded Token:', decodedToken);

  // Calculate expiration in minutes (convert seconds to minutes)
  const expirationInMinutes = Math.floor(
    (decodedToken.exp - decodedToken.iat) / 60
  );

  Cookies.set('token', token, {
    expires: expirationInMinutes / (24 * 60), // Convert minutes to days for js-cookie
    path: '/',
  });
  Cookies.set('user', decodeURIComponent(JSON.stringify(decodedToken.data)), {
    expires: expirationInMinutes / (24 * 60), // Convert minutes to days for js-cookie
    path: '/',
  });
};

/**
 * Removes a JWT token from cookies
 * @param {string} cookieName - The name of the cookie to remove
 */
export const removeTokenCookie = (cookieName) => {
  Cookies.remove(cookieName, { path: '/' });
};

/**
 * Checks if a JWT token is expired
 * @param {string} token - The JWT token to check
 * @returns {boolean} True if token is expired, false otherwise
 */
export const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return true;

    // Check if token is expired (exp is in seconds, Date.now() is in milliseconds)
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
};

/**
 * Validates if a token exists and is not expired
 * @param {string} token - The JWT token to validate
 * @returns {boolean} True if token is valid and not expired
 */
export const isTokenValid = (token) => {
  return token && !isTokenExpired(token);
};

/**
 * Gets the current token and validates it
 * @returns {string|null} Valid token or null if invalid/expired
 */
export const getValidToken = () => {
  const token = getCookieItem('token');
  return isTokenValid(token) ? token : null;
};
