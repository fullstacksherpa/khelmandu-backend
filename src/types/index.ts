import { Document, Types } from "mongoose";
import { ObjectId } from "bson";

import mongoose from "mongoose";
import { Request } from "express";

export interface IUser extends Document {
  _id: ObjectId; // User's unique identifier
  email: string; // User's email, required
  phoneNumber: string; // User's phone number, required
  password: string; // User's hashed password, required
  username: string; // User's username, required
  image?: string; // URL of the user's profile image, optional
  skill?: "beginner" | "intermediate" | "advanced"; // User's skill level, optional
  noOfGames: number; // Number of games played by the user, default: 0
  playpals: ObjectId[] | IUser[]; // Array of ObjectId references to other users or IUser objects
  sports: (
    | "futsal"
    | "basketball"
    | "badminton"
    | "e-sport"
    | "cricket"
    | "tennis"
  )[]; // Array of sports the user plays
  refreshToken?: string | null; // Refresh token, optional
  resetPasswordToken?: string | null; // Token for resetting the password, optional
  resetPasswordExpires?: Date | null; // Expiry date for the reset password token, optional
  isEmailVerified: boolean; // Indicates if the user's email is verified, default: false
  emailVerificationToken?: string | null; // Token for email verification, optional
  emailVerificationExpires?: Date | null; // Expiry date for the email verification token, optional
  createdAt?: Date; // Timestamp for when the user was created, optional
  updatedAt?: Date; // Timestamp for when the user was last updated, optional

  // Instance methods
  isPasswordCorrect(password: string): Promise<boolean>; // Method to verify the password
  generateAccessToken(): string; // Method to generate access token
  generateRefreshToken(): string; // Method to generate refresh token
}

export type ISafeUser = Omit<IUser, "password" | "refreshToken">;

export interface CustomMulterRequest extends Request {
  files?: {
    image?: Express.Multer.File[]; // Use the field name you defined in multer
  };
}

export interface JwtAccessTokenPayload {
  _id: ObjectId; // User's MongoDB ObjectId
  email: string; // User's email
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
