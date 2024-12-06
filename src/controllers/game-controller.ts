import Game from "@src/models/game.model.js";
import { Request, Response } from "express";
import {
  CustomRequestWithGameId,
  IUser,
  IFormattedGame,
} from "@src/types/index.js";
import moment from "moment";
import mongoose from "mongoose";

export async function createGame(req: Request, res: Response): Promise<void> {
  try {
    const { sport, area, date, time, admin, totalPlayers } = req.body;

    const newGame = new Game({
      sport,
      area,
      date,
      time,
      admin,
      totalPlayers,
      players: [admin],
    });

    const savedGame = await newGame.save();
    res.status(200).json(savedGame);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create game" });
  }
}

export async function getGame(req: Request, res: Response): Promise<void> {
  try {
    // Find games and populate fields with type assertions
    const games = await Game.find({})
      .populate<{ admin: IUser }>("admin")
      .populate<{ players: IUser[] }>("players", "image firstName lastName")
      .exec();

    const currentDate = moment();

    // Filter games based on current date and time
    const filteredGames = games.filter((game) => {
      const gameDate = moment(game.date, "Do MMMM"); // Assuming date format is like "9th July"
      const gameTime = game.time.split(" - ")[0]; // Get the start time of the game
      const gameDateTime = moment(
        `${gameDate.format("YYYY-MM-DD")} ${gameTime}`,
        "YYYY-MM-DD h:mm A"
      );

      return gameDateTime.isAfter(currentDate);
    });
    // Format the filtered games for response
    const formattedGames: IFormattedGame[] = filteredGames.map((game) => ({
      _id: game._id.toString(),
      sport: game.sport,
      date: game.date,
      time: game.time,
      area: game.area,
      players: game.players.map((player: IUser) => ({
        _id: player._id.toString(),
        imageUrl: player.image,
        name: `${player.firstName} ${player.lastName}`,
      })),
      totalPlayers: game.totalPlayers,
      queries: game.queries.map((query) => ({
        question: query.question ?? null, // Ensuring question is either string, null, or undefined
        answer: query.answer ?? null, // Ensuring answer is either string, null, or undefined
      })),
      requests: game.requests.map((req) => ({
        userId: req.userId.toString(),
        comment: req.comment ?? null,
      })),
      isBooked: game.isBooked,
      adminName: `${game.admin.firstName} ${game.admin.lastName}`,
      adminUrl: game.admin.image,
      matchFull: game.matchFull,
      courtNumber: game.courtNumber,
    }));

    // Send the response
    res.json(formattedGames);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch games" });
  }
}

export async function getUpcoming(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.query.userId as string;

    // Check if userId is provided
    if (!userId) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }

    // Fetch games where the user is either the admin or a player
    const games = await Game.find({
      $or: [
        { admin: userId }, // Check if the user is the admin
        { players: userId }, // Check if the user is in the players list
      ],
    })
      .populate<{ admin: IUser }>("admin", "firstName lastName image")
      .populate<{ players: IUser[] }>("players", "image firstName lastName");

    // Format games with the necessary details
    const formattedGames = games.map((game) => ({
      _id: game._id.toString(),
      sport: game.sport,
      date: game.date.toString(), // Ensure it's a string format if needed
      time: game.time,
      area: game.area,
      players: (game.players as IUser[]).map((player) => ({
        _id: player._id.toString(),
        imageUrl: player.image,
        name: `${player.firstName} ${player.lastName}`,
      })),
      totalPlayers: game.totalPlayers,
      queries: game.queries.map((query) => ({
        question: query.question || "", // Ensure question is always a string
        answer: query.answer || "", // Ensure answer is always a string
      })),
      requests: game.requests.map((request) => ({
        userId: request.userId.toString(),
        comment: request.comment || "", // Ensure comment is a string if needed
      })),
      isBooked: game.isBooked,
      courtNumber: game.courtNumber,
      adminName: `${game.admin.firstName} ${game.admin.lastName}`,
      adminUrl: game.admin.image,
      isUserAdmin: game.admin._id.toString() === userId,
      matchFull: game.matchFull,
    }));

    res.json(formattedGames); // Return the array of formatted games
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch upcoming games" });
  }
}

export async function gameRequest(req: Request, res: Response): Promise<any> {
  try {
    const { userId, comment } = req.body; // Assuming the userId and comment are sent in the request body
    const { gameId } = req.params;

    // Check if userId is provided
    if (!userId) {
      return res.status(400).json({ message: "UserId is required" });
    }

    // Validate if userId is a valid ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId format" });
    }

    // Validate if gameId is valid
    if (!mongoose.Types.ObjectId.isValid(gameId)) {
      return res.status(400).json({ message: "Invalid gameId format" });
    }

    // Find the game by ID
    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    // Check if the user has already requested to join the game
    const existingRequest = game.requests.find(
      (request) => request.userId.toString() === userId
    );
    if (existingRequest) {
      return res.status(400).json({ message: "Request already sent" });
    }

    // Add the user's ID and comment (or empty string) to the requests array
    game.requests.push({ userId, comment: comment || "" });

    // Save the updated game document
    const updatedGame = await game.save();

    res
      .status(200)
      .json({ message: "Request sent successfully", game: updatedGame });
  } catch (error) {
    console.error("Error occurred while sending request:");
    res
      .status(500)
      .json({ message: "An error occurred while processing your request" });
  }
}
interface IGameRequest {
  userId: IUserPopulate; // Ensure userId is of type IUserPopulate
  comment: string;
}

interface IUserPopulate {
  _id: mongoose.Types.ObjectId;
  email: string;
  firstName: string;
  lastName: string;
  image: string;
  skill: string;
  noOfGames: number;
  playpals: mongoose.Types.ObjectId[];
  sports: string[];
}

// Game interface
export interface IGame extends Document {
  sport: string;
  area: string;
  date: string;
  time: string;
  activityAccess: "public" | "private";
  totalPlayers: number;
  instruction?: string;
  admin: mongoose.Types.ObjectId; // Referencing the User model
  players: mongoose.Types.ObjectId[]; // Array of User references
  queries: { question: string; answer: string }[];
  requests: IGameRequest[]; // Array of requests, each with a userId reference
  isBooked: boolean;
  matchFull: boolean;
  courtNumber?: string; // Optional, could be required depending on your app
}

export async function getRequests(req: Request, res: Response): Promise<void> {
  try {
    const { gameId } = req.params;
    const game = await Game.findOne({ _id: gameId })
      .populate({
        path: "requests.userId",
        select:
          "email firstName lastName image skill noOfGames playpals sports",
      })
      .exec();

    console.log("Populated Game:", game);

    if (!game) {
      res.status(404).json({ message: "Game not found" });
      return;
    }
    console.log("Requests before filtering:", game.requests);

    const gameWithType = game as unknown as IGame;

    // Filter out requests with null userId before mapping
    const validRequests = gameWithType.requests.filter(
      (request) => request.userId !== null
    );

    console.log("Valid Requests:", validRequests);

    // Map through requests and extract relevant user info
    const requestsWithUserInfo = validRequests.map((request) => ({
      userId: request.userId._id, // Already populated, no need to cast
      email: request.userId.email,
      firstName: request.userId.firstName,
      lastName: request.userId.lastName,
      image: request.userId.image,
      skill: request.userId.skill,
      noOfGames: request.userId.noOfGames,
      playpals: request.userId.playpals,
      sports: request.userId.sports,
      comment: request.comment,
    }));

    res.json(requestsWithUserInfo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch requests" });
  }
}

export async function acceptRequest(req: Request, res: Response): Promise<any> {
  const { gameId, userId } = req.body;

  try {
    // Find the game and update in one operation
    const updatedGame = await Game.findByIdAndUpdate(
      gameId,
      {
        $push: { players: userId }, // Add user to players array
        $pull: { requests: { userId: userId } }, // Remove user from requests
      },
      { new: true } // Return the updated game document
    ).exec();

    if (!updatedGame) {
      return res.status(404).json({ message: "Game not found" });
    }

    res.status(200).json({
      message: "Request accepted successfully",
      game: updatedGame,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}

export async function gamePlayers(req: Request, res: Response): Promise<any> {
  try {
    const { gameId } = req.params;

    // Validate gameId
    if (!mongoose.Types.ObjectId.isValid(gameId)) {
      return res.status(400).json({ message: "Invalid game ID" });
    }

    // Fetch game and populate players with limited fields
    const game = await Game.findById(gameId).populate({
      path: "players",
      select: "email firstName lastName image skill noOfGames sports", // Select relevant fields
    });

    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    // Check if the game has players
    if (!game.players.length) {
      return res
        .status(200)
        .json({ message: "No players in this game", players: [] });
    }

    res.status(200).json({ players: game.players });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch players in the game" });
  }
}

export async function toggleMatchfull(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const { gameId } = req.body;

    // Use findByIdAndUpdate with $set to toggle the field
    const game = await Game.findByIdAndUpdate(
      gameId,
      [
        { $set: { matchFull: { $not: "$matchFull" } } }, // Toggle the field
      ],
      { new: true } // Return the updated document
    );

    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    res.json({
      message: "Match full status updated",
      matchFull: game.matchFull,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update match full status" });
  }
}
