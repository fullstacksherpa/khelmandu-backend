import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "@middlewares/errorHandlerMiddleware.js";
import authRoute from "@routes/auth.routes.js";

const app = express();

// Use the centralized error-handling middleware
app.use(errorHandler);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true, limit: "20kb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello World?");
});

app.use("/auth", authRoute);
export { app };
