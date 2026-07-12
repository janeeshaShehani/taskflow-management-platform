import cookieParser from "cookie-parser";
import cors from "cors";
import express, {
  type Request,
  type Response,
} from "express";
import helmet from "helmet";
import morgan from "morgan";
import authRouter from "./routes/auth.routes.js";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:3000",
    credentials: true,
  }),
);

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "TaskFlow API is running",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRouter);

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
  });
});

export default app;