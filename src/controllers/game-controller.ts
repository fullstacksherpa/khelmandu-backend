import Game from "@src/models/game.model.js";
import { Request, Response } from "express";
import { IGame, IUser } from "@src/types/index.js";
import moment from "moment";
import mongoose from "mongoose";
import { z } from "zod";
import { ApiError } from "@src/utils/ApiError";
import Venue from "@src/models/venue.model";
import { IVenue } from "@src/types/venueInterface";

interface IPopulatedVenue {
  _id: string;
  name: string;
  phone: string;
  address?: string; // Add any other fields you populate
}

//  "6:00 AM", "8:00 AM", "21, July"
const convertToDatabaseFormat = (
  startTime: string,
  endTime: string,
  date: string
) => {
  // Validate and parse the date
  const parsedDate = moment(date, "DD, MMMM", true); // Expecting "21, July"

  if (!parsedDate.isValid()) {
    throw new Error("Invalid date format. Expected format: '21, July'.");
  }

  // Combine date with time
  const startDateTime = moment(
    `${parsedDate.format("YYYY-MM-DD")} ${startTime}`,
    "YYYY-MM-DD h:mm A"
  );
  const endDateTime = moment(
    `${parsedDate.format("YYYY-MM-DD")} ${endTime}`,
    "YYYY-MM-DD h:mm A"
  );

  // Validate times
  if (!startDateTime.isValid() || !endDateTime.isValid()) {
    throw new Error("Invalid time format.");
  }

  if (endDateTime.isSameOrBefore(startDateTime)) {
    throw new Error("End time must be after start time.");
  }

  // Convert to JavaScript Date for database compatibility
  return { startTime: startDateTime.toDate(), endTime: endDateTime.toDate() };
};

// Define the request body schema
const createGameSchema = z.object({
  sport: z.string(),
  venueId: z.string(),
  gameStartTime: z.string(),
  gameEndTime: z.string(),
  date: z.string(),
  visibility: z.enum(["public", "private"]).optional().default("public"),
  maxPlayers: z.number().min(1).max(50),
  instruction: z.string().max(600).optional().default(""),
});

export async function createGame(req: Request, res: Response): Promise<void> {
  try {
    // Parse and validate the request body
    const {
      sport,
      venueId,
      gameStartTime,
      gameEndTime,
      date,
      visibility,
      maxPlayers,
      instruction,
    } = createGameSchema.parse(req.body);

    // Convert user input into database-compatible format
    const { startTime, endTime } = convertToDatabaseFormat(
      gameStartTime,
      gameEndTime,
      date
    );

    // Ensure the admin user is attached to the request
    if (!req.user) {
      throw new ApiError(401, "Unauthorized: User not found");
    }
    const admin = req.user._id;

    // Find the venue
    const venue = await Venue.findById(venueId);
    if (!venue) {
      res.status(404).json({ success: false, message: "Venue not found" });
      return;
    }

    // Create the new game
    const game = new Game({
      sport,
      startTime,
      endTime,
      visibility,
      maxPlayers,
      instruction: instruction || "",
      admin,
      venue: venue?._id,
      location: {
        type: "Point",
        coordinates: venue.location.coordinates, // Assign venue's coordinates
      },
      status: "active",
      isBooked: false,
      matchFull: false,
    });

    // Save to the database
    await game.save();

    // Send the response
    res.status(201).json({
      success: true,
      message: "Game created successfully",
      game,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error creating game:", error.message);
      res.status(500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    } else {
      console.error("Unknown error:", error);
      res.status(500).json({
        success: false,
        message: "An unexpected error occurred",
      });
    }
  }
}

//GET /games?page=2&limit=5&venueId=603c72efc0b9ae5f01d0ab20

export async function getGame(req: Request, res: Response): Promise<void> {
  try {
    // Pagination query parameters
    const page = parseInt(req.query.page as string) || 1; // Default page 1
    const limit = parseInt(req.query.limit as string) || 10; // Default 10 games per page
    const { sport, venueId } = req.query;

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Current date and time for filtering
    const currentDateTime = moment();

    // Build dynamic filters
    const filters: Record<string, any> = {
      startTime: { $gte: currentDateTime.toDate() },
    };

    if (sport) filters.sport = sport;
    if (venueId) filters.venue = venueId;

    // Fetch and filter games
    const games = await Game.find(filters)
      .populate<{ admin: IUser }>("admin", "image username skill")
      .populate<{ players: IUser[] }>("players", "image username skill")
      .populate<{ venue: IVenue }>("venue", "name phone address")
      .sort({ startTime: 1 }) // Sort by startTime (earliest first)
      .skip(skip)
      .limit(limit)
      .lean() //use lean for better performance it give plain js object
      .exec();

    // Total count for pagination metadata
    const totalGames = await Game.countDocuments(filters);
    const totalPages = Math.ceil(totalGames / limit);

    // Format games for response
    const formattedGames = games.map((game) => ({
      _id: game._id.toString(),
      sport: game.sport,
      startTime: game.startTime,
      endTime: game.endTime,
      venue: {
        _id: game.venue._id.toString(),
        name: game.venue.name,
        phone: game.venue.phone,
      },
      players: (game.players as any[]).map((player) => {
        if (!player._id || !player.username) {
          throw new Error("Invalid populated player data");
        }
        return {
          _id: player._id.toString(),
          imageUrl: player.image,
          username: player.username,
        };
      }),
      maxPlayers: game.maxPlayers,
      queries: game.chat.map((message) => ({
        sender: message.sender.toString(),
        content: message.content,
        timestamp: message.timestamp,
      })), // Updated to reflect chat structure
      requests: game.requests.map((req) => ({
        userId: req.userId.toString(),
        comment: req.comment ?? null,
      })),
      isBooked: game.isBooked,
      admin: {
        _id: game.admin._id.toString(),
        username: game.admin.username, // Updated to use username
        imageUrl: game.admin.image,
      },
      matchFull: game.matchFull,
      courtNumber: game.courtNumber,
    }));

    // Send paginated response
    res.status(200).json({
      success: true,
      page,
      limit,
      totalGames,
      totalPages,
      games: formattedGames,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch games" });
  }
}

//GET /games?latitude=27.7172&longitude=85.3240&radius=120000&page=1&limit=5

export async function getNearestGames(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { latitude, longitude, maxDistance = 20000 } = req.query;

    if (!latitude || !longitude) {
      res.status(400).json({
        success: false,
        message: "Latitude and longitude are required",
      });
      return;
    }

    const userLocation = [
      parseFloat(longitude as string),
      parseFloat(latitude as string),
    ];

    const games = await Game.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: userLocation,
          },
          $maxDistance: parseInt(maxDistance as string),
        },
      },
    })
      .populate("venue", "name address phone")
      .populate("admin", "username image skill")
      .populate("players", "username image  skill");

    res.status(200).json({ success: true, games });
  } catch (error) {
    console.error("Error fetching nearest games:", error);
    res.status(500).json({ success: false, message: "Failed to fetch games" });
  }
}

export async function getUpcoming(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.query.userId as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    if (!userId) {
      res.status(400).json({ success: false, message: "User ID is required" });
      return;
    }

    // Fetch games where the user is either the admin or a player
    const games = await Game.find({
      $or: [{ admin: userId }, { players: userId }],
    })
      .populate("admin", "image username skill")
      .populate("players", "image username skill")
      .populate("venue", "name phone address")
      .skip(skip)
      .limit(limit)
      .lean();

    const totalGames = await Game.countDocuments({
      $or: [{ admin: userId }, { players: userId }],
    });
    const totalPages = Math.ceil(totalGames / limit);

    // Format games with the necessary details
    const formattedGames = games.map((game) => ({
      _id: game._id.toString(),
      sport: game.sport,
      startTime: game.startTime,
      endTime: game.endTime,
      venue: game.venue,
      players: (game.players as any[])
        .filter((player) => player._id && player.username)
        .map((player) => ({
          _id: player._id.toString(),
          imageUrl: player.image,
          username: player.username,
        })),
      maxPlayers: game.maxPlayers,
      queries: game.chat?.map((message) => ({
        sender: message.sender.toString(),
        content: message.content,
        timestamp: message.timestamp,
      })),
      requests: game.requests.map((req) => ({
        userId: req.userId.toString(),
        comment: req.comment ?? null,
      })),
      isBooked: game.isBooked,
      admin: game.admin,
      matchFull: game.matchFull,
      courtNumber: game.courtNumber,
    }));

    res.status(200).json({
      success: true,
      page,
      limit,
      totalGames,
      totalPages,
      games: formattedGames,
    });
  } catch (err) {
    console.error("Error fetching upcoming games:", err);

    if (err instanceof Error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch upcoming games",
        ...(process.env.NODE_ENV === "development" && { error: err.message }),
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to fetch upcoming games",
        ...(process.env.NODE_ENV === "development" && { error: String(err) }),
      });
    }
  }
}

export async function gameRequest(req: Request, res: Response): Promise<void> {
  try {
    const { userId, comment } = req.body; // Assuming the userId and comment are sent in the request body
    const { gameId } = req.params;

    // Validate userId and gameId
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ message: "Invalid or missing userId" });
      return;
    }

    if (!gameId || !mongoose.Types.ObjectId.isValid(gameId)) {
      res.status(400).json({ message: "Invalid or missing gameId" });
      return;
    }

    // Find the game by ID
    const game = await Game.findById(gameId);
    if (!game) {
      res.status(404).json({ message: "Game not found" });
      return;
    }

    // Check if the user has already requested to join the game
    const requestExists = game.requests.some(
      (request) => request.userId.toString() === userId
    );
    if (requestExists) {
      res.status(400).json({ message: "Request already sent" });
      return;
    }

    // Add the user's ID and comment to the requests array
    game.requests.push({ userId, comment: comment || "" });

    // Save the updated game document
    await game.save();

    res.status(200).json({
      success: true,
      message: "Request sent successfully",
      request: { userId, comment: comment || "" },
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error occurred while sending request:", error.message);
      res.status(500).json({
        success: false,
        message: "An error occurred while processing your request",
        ...(process.env.NODE_ENV === "development" && { error: error.message }),
      });
    } else {
      console.error("Unknown error:", error);
      res.status(500).json({
        success: false,
        message: "An unexpected error occurred",
      });
    }
  }
}

function isPopulatedUser(user: unknown): user is IUser {
  return typeof user === "object" && user !== null && "username" in user;
}

export async function getRequests(req: Request, res: Response): Promise<void> {
  try {
    const { gameId } = req.params;
    const game = await Game.findOne({ _id: gameId })
      .populate({
        path: "requests.userId",
        select: "phoneNumber, username, image, skill noOfGames",
      })
      .exec();

    console.log("Populated Game:", game);

    if (!game) {
      res.status(404).json({ message: "Game not found" });
      return;
    }
    console.log("Requests before filtering:", game.requests);

    // Map through requests and extract relevant user info
    const requestsWithUserInfo = game.requests
      .filter((request) => request.userId !== null)
      .map((request) => {
        if (isPopulatedUser(request.userId)) {
          return {
            userId: request.userId._id.toString(),
            username: request.userId.username,
            image: request.userId.image,
            skill: request.userId.skill,
            noOfGames: request.userId.noOfGames,
            phoneNumber: request.userId.phoneNumber,
            comment: request.comment,
          };
        } else {
          throw new Error("UserId is not populated or invalid");
        }
      });

    res.json(requestsWithUserInfo);
  } catch (err) {
    // Log the error with more details
    console.error("Error fetching game requests:", err);

    // Build a generic error message
    const genericMessage =
      "An unexpected error occurred while processing your request";

    // Check if the error is an instance of Error
    if (err instanceof Error) {
      res.status(500).json({
        success: false,
        message: genericMessage,
        ...(process.env.NODE_ENV === "development" && { error: err.message }),
      });
    } else {
      // Handle cases where the error is not an instance of Error (e.g., unknown types)
      res.status(500).json({
        success: false,
        message: genericMessage,
        ...(process.env.NODE_ENV === "development" && { error: String(err) }),
      });
    }
  }
}

export async function acceptRequest(
  req: Request,
  res: Response
): Promise<void> {
  const { gameId, userId } = req.body;

  try {
    // Validate gameId and userId
    if (!mongoose.Types.ObjectId.isValid(gameId)) {
      res.status(400).json({ message: "Invalid gameId format" });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ message: "Invalid userId format" });
      return;
    }

    // Update the game: add user to players, remove from requests
    const updatedGame = await Game.findByIdAndUpdate(
      gameId,
      {
        $push: { players: userId }, // Add user to players array
        $pull: { requests: { userId: userId } }, // Remove user from requests array
      },
      { new: true } // Return the updated game document
    ).exec();

    // Check if the game exists
    if (!updatedGame) {
      res.status(404).json({ message: "Game not found" });
      return;
    }

    // Respond with success
    res.status(200).json({
      success: true,
      message: "Request accepted successfully",
      game: updatedGame,
    });
  } catch (error) {
    console.error("Error while accepting request:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while accepting the request",
      ...(process.env.NODE_ENV === "development" && {
        error: (error as Error).message,
      }),
    });
  }
}

export async function gamePlayers(req: Request, res: Response): Promise<void> {
  try {
    const { gameId } = req.params;

    // Validate gameId
    if (!mongoose.Types.ObjectId.isValid(gameId)) {
      res.status(400).json({
        success: false,
        message: "Invalid game ID",
      });
      return;
    }

    // Fetch the game and populate players with limited fields
    const game = await Game.findById(gameId).populate({
      path: "players",
      select: "phoneNumber, username, image, skill noOfGames", // Select relevant fields
    });

    if (!game) {
      res.status(404).json({
        success: false,
        message: "Game not found",
      });
      return;
    }

    // Check if the game has players
    if (!game.players || !game.players.length) {
      res.status(200).json({
        success: true,
        message: "No players in this game",
        players: [],
      });
      return;
    }

    // Return populated players
    res.status(200).json({
      success: true,
      message: "Players fetched successfully",
      players: game.players,
    });
  } catch (err) {
    console.error("Error fetching players:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch players in the game",
      ...(process.env.NODE_ENV === "development" && {
        error: (err as Error).message,
      }),
    });
  }
}

export async function toggleMatchfull(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { gameId } = req.body;

    // Validate gameId
    if (!mongoose.Types.ObjectId.isValid(gameId)) {
      res.status(400).json({ message: "Invalid gameId format" });
      return;
    }

    // Find the game and toggle the matchFull field
    const game = await Game.findById(gameId);

    if (!game) {
      res.status(404).json({ message: "Game not found" });
      return;
    }

    // Toggle the matchFull field
    game.matchFull = !game.matchFull;

    // Save the updated game
    await game.save();

    res.status(200).json({
      message: "Match full status updated",
      matchFull: game.matchFull,
    });
  } catch (error) {
    console.error("Error updating match full status:", error);
    res.status(500).json({
      message: "Failed to update match full status",
      ...(process.env.NODE_ENV === "development" && {
        error: (error as Error).message,
      }),
    });
  }
}
