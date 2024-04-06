import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { ErrorMiddleware } from "./middleware/error";
import { rateLimit } from "express-rate-limit";
import userRouter from "./routes/user.route";
import projectRouter from "./routes/project.route";
import cookieParser from "cookie-parser";
import layoutRouter from "./routes/layout.route";
import contactRouter from "./routes/contact.route";
require("dotenv").config();

export const app = express();

// body parser
app.use(express.json({ limit: "50mb" }));

// cookie parser
app.use(cookieParser());

// enable CORS(cross origin resource sharing)
app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  })
);

// api request limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

// routes
app.use("/api/v1", userRouter, projectRouter, layoutRouter, contactRouter);

// testing api
app.get("/test", (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    success: true,
    message: "API is working",
  });
});

// unknown routes
app.all("*", (req: Request, res: Response, next: NextFunction) => {
  const err = new Error(`Route ${req.originalUrl} not found`) as any;
  err.statusCode = 404;
  next(err);
});

// Middleware calls
// Apply the rate limiting middleware to all requests.
app.use(limiter);
app.use(ErrorMiddleware);
