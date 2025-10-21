// Utility functions for caching profile pictures in localStorage
const PROFILE_IMAGE_URL_KEY = "profilePicLink";

/**
 * Caches a profile picture URL in localStorage
 * @param {string} imageUrl - The URL of the image
 */
export const cacheProfileImage = (imageUrl) => {
  try {
    localStorage.setItem(PROFILE_IMAGE_URL_KEY, imageUrl);
  } catch (error) {
    console.error("Error caching profile image URL:", error);
  }
};

/**
 * Retrieves cached profile image URL from localStorage
 * @returns {string|null} The cached image URL, or null if not cached
 */
export const getCachedProfileImage = () => {
  try {
    const imageUrl = localStorage.getItem(PROFILE_IMAGE_URL_KEY);
    return imageUrl;
  } catch (error) {
    console.error("Error retrieving cached profile image URL:", error);
    return null;
  }
};

/**
 * Clears the cached profile image from localStorage
 */
export const clearProfileImageCache = () => {
  try {
    localStorage.removeItem(PROFILE_IMAGE_URL_KEY);
  } catch (error) {
    console.error("Error clearing profile image cache:", error);
  }
};

/**
 * Caches a profile picture URL (synchronous operation)
 * @param {string} imageUrl - The URL of the image to cache
 * @returns {string} The image URL
 */
export const fetchAndCacheProfileImage = (imageUrl) => {
  if (!imageUrl) {
    return null;
  }

  try {
    cacheProfileImage(imageUrl);
    return imageUrl;
  } catch (error) {
    console.error("Error caching profile image URL:", error);
    return imageUrl; // Return URL even if caching fails
  }
};

/**
 * Checks if a profile image URL is cached
 * @param {string} imageUrl - The URL to check
 * @returns {boolean} True if the image is cached
 */
export const isProfileImageCached = (imageUrl) => {
  const cached = getCachedProfileImage();
  return cached === imageUrl;
};
