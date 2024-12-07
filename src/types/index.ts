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

export interface JwtAccessTokenPayload {
  _id: ObjectId; // User's MongoDB ObjectId
  email: string; // User's email
}

export interface JwtRefreshTokenPayload {
  _id: ObjectId; // User's MongoDB ObjectId
}

// Custom Request interface with gameId in params for Express request handlers
export interface CustomRequestWithGameId extends Request {
  params: {
    gameId: string; // gameId param passed in the URL
  };
}

// Interface for Chat Messages
export interface IChat {
  sender: IUser | mongoose.Types.ObjectId; // Reference to the user or populated user object
  content: string; // Message content
  timestamp?: Date; // Timestamp for when the message was sent
}

// Interface for Game Requests
export interface IGameRequest {
  userId: IUser | mongoose.Types.ObjectId; // Reference to the user or populated user object
  comment?: string; // Optional comment within the request
  requestedAt?: Date; // Timestamp for when the request was made
}

// Interface for a Player
export interface IPlayer {
  _id: string;
  image: string; // URL to the player's profile image
  firstName: string;
  lastName: string;
}

// Main Game Interface (Mapped to Mongoose Schema)
export interface IGame extends Document {
  sport: string; // Name of the sport
  venue: mongoose.Types.ObjectId; // Reference to Venue
  location: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  startTime: Date; // Game start time
  endTime: Date; // Game end time
  visibility: "public" | "private"; // Game visibility (default: "public")
  maxPlayers: number; // Maximum number of players allowed
  instruction?: string; // Optional game instructions
  admin: IUser | mongoose.Types.ObjectId; // Reference to the admin user or populated user object
  players: (IUser | mongoose.Types.ObjectId)[]; // Array of players (User references or populated)
  chat: IChat[]; // Array of chat messages
  requests: IGameRequest[]; // Array of requests for the game
  status: "active" | "cancelled" | "completed"; // Game status
  cancellationReason?: string; // Reason for cancellation (if applicable)
  isBooked: boolean; // Whether the game is booked
  matchFull: boolean; // Whether the match is full
  courtNumber?: string; // Optional court number
  createdAt?: Date; // Timestamp for when the game was created
  updatedAt?: Date; // Timestamp for when the game was last updated
}

// Interface for the Formatted Game Response
export interface IFormattedGame {
  _id: string; // Unique ID of the game
  sport: string; // Name of the sport
  venue: string; // Location of the game
  date: string; // Formatted game date (e.g., "10th January 2024")
  time: string; // Formatted game time (e.g., "6:00 AM - 8:00 AM")
  players: {
    _id: string; // Unique ID of the player
    imageUrl: string; // URL to the player's profile image
    name: string; // Full name of the player
  }[]; // Array of player objects
  totalPlayers: number; // Total players allowed in the game
  queries: {
    question: string | null; // Question from chat (if applicable)
    answer: string | null; // Answer from chat (if applicable)
  }[]; // Array of query objects
  requests: {
    userId: string; // ID of the user making the request
    comment?: string; // Optional comment from the user
  }[]; // Array of request objects
  isBooked: boolean; // Whether the game is booked
  adminName: string; // Full name of the admin
  adminUrl: string; // URL to the admin's profile image
  matchFull: boolean; // Whether the match is full
  courtNumber?: string | null; // Optional court number
}

export interface IMessageSender {
  _id: string; // Unique ID of the sender (user or admin)
  username: string; // Username of the sender
}

export interface IMessage {
  sender: IMessageSender; // Details of the message sender
  content: string; // The message content
  timestamp: string; // ISO string representing the timestamp of the message
}

export interface IChatPair {
  userMessage: IMessage; // The message sent by the user
  adminReply: IMessage; // The reply from the admin
}

export type IChatPairs = IChatPair[]; // Array of paired message
