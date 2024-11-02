import { Document, ObjectId } from "mongoose";
import mongoose from "mongoose";
import { Request } from "express";

export interface IUser extends Document {
  email: string;
  phoneNumber: string;
  password: string;
  firstName: string;
  lastName?: string;
  image: string;
  skill?: string;
  otp?: string;
  noOfGames: number;
  playpals: mongoose.Types.ObjectId[];
  sports: string[];
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
