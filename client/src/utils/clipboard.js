/**
 * Robust clipboard copy utility with fallback
 * Handles various browser compatibility and permission issues
 */

/**
 * Copy text to clipboard with fallback method
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} - Success status
 */
export const copyToClipboard = async (text) => {
  if (!text) {
    throw new Error('No text provided to copy');
  }

  // Method 1: Modern Clipboard API (preferred)
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn('Clipboard API failed, trying fallback:', err);
      // Fall through to fallback method
    }
  }

  // Method 2: Fallback using execCommand (works in more browsers)
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;

    // Make the textarea invisible but still part of the document
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    textArea.style.opacity = '0';

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);

      if (!successful) {
        throw new Error('execCommand("copy") returned false');
      }

      return true;
    } catch (err) {
      document.body.removeChild(textArea);
      throw err;
    }
  } catch (err) {
    console.error('All clipboard methods failed:', err);
    throw new Error('Failed to copy to clipboard. Please copy manually.');
  }
};

/**
 * Copy text with user feedback (for use with SweetAlert2)
 * @param {string} text - Text to copy
 * @param {Function} onSuccess - Success callback
 * @param {Function} onError - Error callback with error message
 */
export const copyWithFeedback = async (text, onSuccess, onError) => {
  try {
    await copyToClipboard(text);
    if (onSuccess) onSuccess();
  } catch (error) {
    if (onError) onError(error.message);
  }
};

export default copyToClipboard;
