import createError from "http-errors";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";

import indexRouter from "./routes/v1/index_routes.js";

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/v1", indexRouter);

// 404 handler remains the same
app.use((req, res) => {
  res.status(404).json({
    error: true,
    message: "Error 404 not found",
  });
});

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    error: true,
    message: err.message || "Internal Server Error",
    ...(req.app.get("env") === "development" && { stack: err.stack }),
  });
});

export default app;
