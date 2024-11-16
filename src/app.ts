import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "@middlewares/errorHandlerMiddleware.js";
import authRoute from "@routes/auth.routes.js";
import gameRoute from "@routes/game.routes.js";
import venueRouter from "@routes/venue.routes.js";
import { venues } from "./controllers/venue-controllers.js";
import Venue from "./models/venue.model.js";

const app = express();

// Use the centralized error-handling middleware
app.use(errorHandler);

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

async function addVenues() {
  for (const venueData of venues) {
    // Check if the venue already exists
    const existingVenue = await Venue.findOne({ name: venueData.name });

    if (existingVenue) {
      console.log(`Venue "${venueData.name}" already exists. Skipping.`);
    } else {
      // Add the new venue
      const newVenue = new Venue(venueData);
      await newVenue.save();
      console.log(`Venue "${venueData.name}" added successfully.`);
    }
  }
}

addVenues().catch((err) => {
  console.error("Error adding venues:", err);
});
export { app };
