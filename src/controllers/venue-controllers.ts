import Booking from "@src/models/booking.model";
import Game from "@src/models/game.model";
import Venue from "@src/models/venue.model.js";
import { IVenue } from "@src/types/venueInterface";
import { asyncHandler } from "@src/utils/asyncHandler";
import { Request, Response } from "express";

//GET /api/venues?page=1&limit=10&lng=85.3240&lat=27.7172

export const getVenues = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page as string) || 1; // Default page 1
  const limit = parseInt(req.query.limit as string) || 10; // Default 10 venues per page
  const { lng, lat } = req.query; // Longitude and Latitude for geolocation filtering

  // Pagination calculations
  const skip = (page - 1) * limit;

  // Determine if geolocation filtering is applied
  const geoFilter =
    lng && lat
      ? {
          location: {
            $near: {
              $geometry: {
                type: "Point",
                coordinates: [
                  parseFloat(lng as string),
                  parseFloat(lat as string),
                ],
              },
            },
          },
        }
      : {}; // If no lat/lng, fetch all venues without geolocation sorting

  // Fetch venues with geolocation, pagination, and specific fields populated
  const venuesQuery = Venue.find(geoFilter)
    .select(
      "name location phone defaultSchedule sportsAvailable images address amenities owner iframeLink"
    ) // Include only needed fields
    .populate({
      path: "amenities",
      select: "name", // Populate  `name` for amenities
    })
    .populate({
      path: "owner",
      select: "username email phoneNumber", // Populate specific fields for owner
    })
    .skip(skip)
    .limit(limit);

  // Apply geolocation sorting if `lng` and `lat` are provided
  if (lng && lat) {
    venuesQuery.sort({}); // `$near` automatically sorts by proximity
  }

  const venues = await venuesQuery;

  // Total venues for pagination metadata (without pagination filter)
  const total = await Venue.countDocuments(geoFilter);

  res.status(200).json({
    message: "Venues fetched successfully.",
    page,
    limit,
    total,
    venues,
  });
});

export const bookVenue = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { courtNumber, startTime, endTime, userId, venueId, amount, gameId } =
      req.body;

    // Validate input data
    if (
      !courtNumber ||
      !startTime ||
      !endTime ||
      !userId ||
      !venueId ||
      !amount
    ) {
      res
        .status(400)
        .json({ message: "All required fields must be provided." });
      return;
    }

    // Parse startTime and endTime
    const parsedStartTime = new Date(startTime);
    const parsedEndTime = new Date(endTime);

    // Validate venue existence
    const venue = await Venue.findById(venueId);
    if (!venue) {
      res.status(404).json({ message: "Venue not found." });
      return;
    }

    // Validate the game, if provided
    if (gameId) {
      const game = await Game.findById(gameId);
      if (!game) {
        res.status(404).json({ message: "Game not found." });
        return;
      }
    }

    // Create a new booking
    const newBooking = new Booking({
      courtNumber,
      startTime: parsedStartTime,
      endTime: parsedEndTime,
      user: userId,
      venue: venueId,
      game: gameId || null,
      amount,
      status: "pending",
    });

    // Save the booking (triggers schema middleware)
    await newBooking.save();

    res.status(201).json({
      message: "Booking created successfully.",
      booking: newBooking,
    });
  }
);
