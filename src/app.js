import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

const app = express();

app.use(morgan("dev"));
app.use(cors());
app.use(helmet());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  }),
);
app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

//app.use("/v1/api/", routes);

export default app;
