import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import indexRouter from './routes/v1/index_routes.js';
import { uploadFile, uploadMultipleFiles } from './utils/fileStorage.js';
import { uploadMultiple, uploadSingle } from './middleware/multerMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);

app.post('/upload', uploadSingle('file'), async (req, res) => {
  const { directory } = req.query;
  console.log('directory', directory);
  try {
    if (!req.file) {
      return res.status(400).json({
        error: true,
        message: 'No file uploaded',
      });
    }

    console.log('requested to upload', req);
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
});

app.post('/upload-multiple', uploadMultiple('files'), async (req, res) => {
  try {
    if (!req.files) {
      return res.status(400).json({
        error: true,
        message: 'No file uploaded',
      });
    }

    console.log('req.files', req.files);
    const file = req.files;
    const result = await uploadMultipleFiles(file, req.body.directory);
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
});

app.use('/api/v1', indexRouter);

// Add root route handler
app.get('/', (req, res) => {
  res.json({
    error: false,
    message: 'Welcome to EduOps API. Please use /api/v1 for API endpoints.',
    endpoints: {
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      enrollment: '/api/v1/enrollment',
      files: '/api/v1/files',
      courses: '/api/v1/courses',
      academicPeriods: '/api/v1/academic-periods',
    },
  });
});

const PORT = process.env.PORT || 5555;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.use((req, res) => {
  res.status(404).json({
    error: true,
    message: 'Error 404 not found',
  });
});

export default app;
