import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import indexRouter from './routes/v1/index_routes.js';

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

app.use('/api/v1', indexRouter);

// Add root route handler
app.get('/', (req, res) => {
  res.json({
    error: false,
    message: 'Welcome to EduOps API.',
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
