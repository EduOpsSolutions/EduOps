import axiosInstance from './axios';

export const guestUploadFile = async (file, directory) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('directory', directory);
    const response = await axiosInstance.post(
      `/upload/guest?directory=${directory}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

export const uploadFile = async (file, directory) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('directory', directory);
    const response = await axiosInstance.post(
      `/upload?directory=${directory}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

export const uploadMultipleFiles = async (files, directory) => {
  try {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    formData.append('directory', directory);
    const response = await axiosInstance.post(
      `/upload/multiple?directory=${directory}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error uploading multiple files:', error);
    throw error;
  }
};

export const guestUploadMultipleFiles = async (files, directory) => {
  try {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    formData.append('directory', directory);
    const response = await axiosInstance.post(
      `/upload/guest/multiple?directory=${directory}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error uploading multiple files:', error);
    throw error;
  }
};

// Utility function to detect file type based on URL or file extension
export const getFileType = (url) => {
  if (!url) return 'unknown';

  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
  const documentExtensions = ['.pdf', '.doc', '.docx'];

  // Extract file extension from URL
  const urlParts = url.split('?')[0]; // Remove query parameters
  const extension = urlParts.toLowerCase().substring(urlParts.lastIndexOf('.'));

  if (imageExtensions.includes(extension)) {
    return 'image';
  } else if (documentExtensions.includes(extension)) {
    return 'document';
  }

  return 'unknown';
};

// Utility function to get file name from URL
export const getFileNameFromUrl = (url) => {
  if (!url) return 'document';

  try {
    const urlParts = url.split('?')[0]; // Remove query parameters
    const fileName = urlParts.substring(urlParts.lastIndexOf('/') + 1);
    return fileName || 'document';
  } catch (error) {
    return 'document';
  }
};

// Utility function to download file
export const downloadFile = (url, fileName) => {
  try {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || getFileNameFromUrl(url);
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error downloading file:', error);
    // Fallback: open in new tab
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};
