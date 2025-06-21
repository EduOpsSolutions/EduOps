import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import indexRouter from "./routes/v1/index_routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api/v1", indexRouter);

// Add root route handler
app.get("/", (req, res) => {
  res.json({
    error: false,
    message: "Welcome to EduOps API. Please use /api/v1 for API endpoints.",
    endpoints: {
      auth: "/api/v1/auth",
      users: "/api/v1/users",
      enrollment: "/api/v1/enrollment",
      files: "/api/v1/files",
      courses: "/api/v1/courses",
      academicPeriods: "/api/v1/academic-periods",
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
    message: "Error 404 not found",
  });
});

export default app;
