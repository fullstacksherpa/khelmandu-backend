import { Document } from "mongoose";
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
  files: {
    image?: Express.Multer.File[]; // Use the field name you defined in multer
  };
}
