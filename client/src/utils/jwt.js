import Cookies from 'js-cookie';

/**
 * Gets and decodes a JWT token from cookies
 * @param {string} cookieName - The name of the cookie containing the token
 * @returns {object|null} The decoded token payload or null if not found/invalid
 */
export const getTokenFromCookie = (cookieName) => {
  try {
    const token = Cookies.get(cookieName);
    if (!token) return null;

    // JWT tokens are base64 encoded, so we need to decode them
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Sets a JWT token in cookies
 * @param {string} cookieName - The name of the cookie
 * @param {string} token - The JWT token to store
 * @param {object} options - Cookie options (expires, path, etc.)
 */
export const setTokenCookie = (cookieName, token, options = {}) => {
  Cookies.set(cookieName, token, {
    expires: 7, // 7 days by default
    path: '/',
    ...options,
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
 * Gets a token from cookies
 * @param {string} cookieName - The name of the cookie to get
 * @returns {string|null} The token or null if not found
 */
export const decodeToken = (cookieName) => {
  const token = Cookies.get(cookieName);
  if (!token) return null;

  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );

  console.log('JSON PAYLOAD:', jsonPayload);

  return JSON.parse(jsonPayload);
};
