import { Document, ObjectId, Types } from "mongoose";
import mongoose from "mongoose";
import { Request } from "express";

export interface IUser extends Document {
  _id: string;
  email: string;
  phoneNumber: string;
  password: string;
  firstName: string;
  lastName?: string;
  image: string;
  skill?: string;
  otp?: string;
  noOfGames: number;
  playpals: mongoose.Types.ObjectId[] | IUser[]; // Array of ObjectId references to other users
  sports: string[]; // Array of sports the user plays
  refreshToken?: string;
  isPasswordCorrect(password: string): Promise<boolean>;
  generateAccessToken(): string;
  generateRefreshToken(): string;
}

export interface CustomMulterRequest extends Request {
  files?: {
    image?: Express.Multer.File[]; // Use the field name you defined in multer
  };
}

export interface JwtAccessTokenPayload {
  _id: ObjectId; // User's MongoDB ObjectId
  email: string; // User's email
  username?: string; // Username, if defined
  fullName?: string; // Full name, if defined
}

export interface JwtRefreshTokenPayload {
  _id: ObjectId; // User's MongoDB ObjectId
}

// Game Interface
export interface IGame extends Document {
  title: string; // Title of the game
  date: Date; // Date of the game
  requests: IGameRequest[]; // Array of requests for the game
}

// Custom Request interface with gameId in params for Express request handlers
export interface CustomRequestWithGameId extends Request {
  params: {
    gameId: string; // gameId param passed in the URL
  };
}

// Player Interface
export interface IPlayer {
  _id: string;
  image: string; // Player's profile image URL
  firstName: string;
  lastName: string;
}

// Query Interface for Game Queries
export interface IQuery {
  question: string;
  answer?: string;
}

// Request Interface within Game
export interface IGameRequest {
  userId: IUser | Types.ObjectId; // Populated user or ObjectId reference
  comment?: string; // Optional comment within the request
}

// Game Data Interface (Renamed to IGameData)
export interface IGameData extends Document {
  sport: string;
  area: string;
  date: string; // Date stored as a string in the format "9th July"
  time: string; // Time format, e.g., "10:00 AM - 12:00 PM"
  activityAccess?: string; // Default is "public"
  totalPlayers: number;
  instruction?: string;
  admin: IUser | Types.ObjectId; // Reference to admin user
  players: (IUser | Types.ObjectId)[]; // Array of players (User references or populated)
  queries: IQuery[]; // Array of query objects
  requests: IGameRequest[]; // Array of requests for the game
  isBooked: boolean; // Boolean flag indicating if the game is booked
  matchFull: boolean; // Boolean flag indicating if the game is full
  courtNumber?: string;
}

// Define the structure of the formatted game response
export interface IFormattedGame {
  _id: string; // Unique ID of the game
  sport: string; // Name of the sport
  date: string; // Game date (e.g., "9th July")
  time: string; // Game time (e.g., "10:00 AM - 12:00 PM")
  area: string; // Location of the game
  players: {
    _id: string; // Unique ID of the player
    imageUrl: string; // URL to the player's image
    name: string; // Full name of the player
  }[]; // Array of players
  totalPlayers: number; // Total players allowed in the game
  queries: {
    question: string | null | undefined;
    answer: string | null | undefined;
  }[]; // Array of query objects
  requests: {
    userId: string | null | undefined; // ID of the user making the request
    comment?: string | null | undefined; // Optional comment from the user
  }[]; // Array of request objects
  isBooked: boolean; // Whether the game is booked
  adminName: string; // Admin's full name
  adminUrl: string; // Admin's profile image URL
  matchFull: boolean; // Whether the match is full
  courtNumber?: string | null | undefined; // Optional court number
}
