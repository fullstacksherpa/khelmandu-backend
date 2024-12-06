import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoute from "@routes/auth.routes.js";
import gameRoute from "@routes/game.routes.js";
import venueRouter from "@routes/venue.routes.js";
import { errorHandler } from "./middlewares/errorHandlerMiddleware";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "90kb" }));
app.use(express.urlencoded({ extended: true, limit: "20kb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello World?");
});

app.use("/auth", authRoute);

app.use("/game", gameRoute);

app.use("/venue", venueRouter);

// Use the centralized error-handling middleware
app.use(errorHandler);

export { app };
