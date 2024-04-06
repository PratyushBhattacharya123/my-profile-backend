"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const error_1 = require("./middleware/error");
const express_rate_limit_1 = require("express-rate-limit");
const user_route_1 = __importDefault(require("./routes/user.route"));
const project_route_1 = __importDefault(require("./routes/project.route"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const layout_route_1 = __importDefault(require("./routes/layout.route"));
const contact_route_1 = __importDefault(require("./routes/contact.route"));
require("dotenv").config();
exports.app = (0, express_1.default)();
// body parser
exports.app.use(express_1.default.json({ limit: "50mb" }));
// cookie parser
exports.app.use((0, cookie_parser_1.default)());
// enable CORS(cross origin resource sharing)
exports.app.use(
  (0, cors_1.default)({
    // origin: ["http://localhost:3000"],
    origin: ["https://profile-frontend-rust.vercel.app"],
    credentials: true,
  })
);
// api request limit
const limiter = (0, express_rate_limit_1.rateLimit)({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});
// routes
exports.app.use(
  "/api/v1",
  user_route_1.default,
  project_route_1.default,
  layout_route_1.default,
  contact_route_1.default
);
// testing api
exports.app.get("/test", (req, res, next) => {
  res.status(200).json({
    success: true,
    message: "API is working",
  });
});
// unknown routes
exports.app.all("*", (req, res, next) => {
  const err = new Error(`Route ${req.originalUrl} not found`);
  err.statusCode = 404;
  next(err);
});
// Middleware calls
// Apply the rate limiting middleware to all requests.
exports.app.use(limiter);
exports.app.use(error_1.ErrorMiddleware);
