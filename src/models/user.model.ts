import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { IUser } from "@src/types";

const userSchema = new mongoose.Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "password is required"],
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
    },
    image: {
      type: String, // URL to the user's profile image
      required: true,
    },
    skill: {
      type: String,
    },
    otp: String,
    noOfGames: {
      type: Number,
      default: 0,
    },
    playpals: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Assuming playpals are other users
      },
    ],
    sports: [
      {
        type: String, // Array of sports the user plays
      },
    ],
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password: string) {
  return await bcrypt.compare(password, this.password); //boolean return
};

userSchema.methods.generateAccessToken = function () {
  const secret = process.env.ACCESS_TOKEN_SECRET;
  if (!secret) {
    throw new Error("ACCESS_TOKEN_SECRET is not defined");
  }

  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
    },
    secret,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  const secret = process.env.REFRESH_TOKEN_SECRET;
  if (!secret) {
    throw new Error("Refresh token secret is not defined");
  }
  return jwt.sign(
    {
      _id: this._id,
    },
    secret,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

const User = mongoose.model("User", userSchema);

export default User;
