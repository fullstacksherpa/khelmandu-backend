import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import "dotenv/config";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [/\S+@\S+\.\S+/, "Please provide a valid email address"], // Email validation
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [/^\d{10}$/, "Phone number must be exactly 10 digits"], // 10 digits validation
    },
    password: {
      type: String,
      required: [true, "password is required"],
    },
    username: {
      type: String,
      required: true,
    },
    image: {
      type: String, // URL to the user's profile image
      match: [/^https?:\/\/.*/, "Invalid image URL"], // URL validation
    },
    skill: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
    },
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
        enum: [
          "futsal",
          "basketball",
          "badminton",
          "e-sport",
          "cricket",
          "tennis",
        ],
      },
    ],
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, default: null },
    emailVerificationExpires: { type: Date, default: null },
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
