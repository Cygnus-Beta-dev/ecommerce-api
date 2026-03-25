import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { __dirname } from "./utils/path.js";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import routes from "./routes/index.js";
import { errorHandler, notFound } from "./middlewares/error.middleware.js";

const app = express();

app.use(morgan("dev"));

const corsOptions = {
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
};
app.use(cors(corsOptions));

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "http://localhost:8080"],
      connectSrc: ["'self'", "http://localhost:8080"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  })
);

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
  })
);
app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.use("/v1/api/", routes);
app.use(notFound);
app.use(errorHandler);

export default app;