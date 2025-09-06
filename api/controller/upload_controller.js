import { uploadFile, uploadMultipleFiles } from '../utils/fileStorage.js';

const uploadMultipleFilesController = async (req, res) => {
  const { directory } = req.query;
  try {
    if (!req.files) {
      return res.status(400).json({
        error: true,
        message: 'No file uploaded',
      });
    }

    const file = req.files;
    const result = await uploadMultipleFiles(file, directory);
    res.json({
      error: false,
      data: result,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      error: true,
      message: error.message || 'Failed to upload file',
    });
  }
};

const uploadFileController = async (req, res) => {
  const { directory } = req.query;
  try {
    if (!req.file) {
      return res.status(400).json({
        error: true,
        message: 'No file uploaded',
      });
    }

    const file = req.file;
    const result = await uploadFile(file, directory);
    res.json({
      error: false,
      data: result,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      error: true,
      message: error.message || 'Failed to upload file',
    });
  }
};

export { uploadMultipleFilesController, uploadFileController };
