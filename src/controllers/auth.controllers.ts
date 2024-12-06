import { Request, Response } from "express";
import User from "@src/models/user.model.js";
import { ObjectId } from "mongodb";
import crypto from "crypto";
import { ApiError } from "@src/utils/ApiError";
import { ISafeUser, IUser } from "@src/types/index.js";
import jwt from "jsonwebtoken";

import { ApiResponse } from "@src/utils/ApiResponse";
import mongoose from "mongoose";
import { uploadOnCloudinary } from "@src/utils/cloudinary";
import { sendEmail } from "@src/utils/emailService";

const generateAccessAndRefreshTokens = async (userId: ObjectId) => {
  try {
    const user = (await User.findById(userId)) as IUser;
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "something went wrong while generating refresh and access token"
    );
  }
};

// Register User Handler
export async function registerUser(req: Request, res: Response): Promise<any> {
  try {
    const { email, password, username, phoneNumber } = req.body;
    console.log("Request body:", req.body);

    // Validate input fields
    if (
      [email, password, username, phoneNumber].some(
        (field) => !field || field.trim() === ""
      )
    ) {
      throw new ApiError(400, "All fields are required");
    }

    // Check if user already exists
    const existedUser = await User.findOne({
      $or: [{ phoneNumber }, { email }],
    });
    if (existedUser) {
      throw new ApiError(409, "User with email or phone number already exists");
    }

    // Set default profile picture
    const profilePic =
      "https://res.cloudinary.com/sherpacloudinary/image/upload/v1732843766/userProfile/ofj6tvvwgkahcvr4x4xs.webp";

    // Create new user
    const user = await User.create({
      email,
      password,
      username,
      phoneNumber,
      image: profilePic,
    });

    // Generate tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user._id
    );

    //generate email verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    // Save refresh token to the database
    user.refreshToken = refreshToken;
    await user.save();

    //send verification email
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    await sendEmail(
      user.email,
      "Khelmandu | email verification Links",
      `
    <h4>Hi ${user.username},</h4>
<p>We hope you're enjoying your experience with Khelmandu! We're thrilled to have you as part of our community. To ensure your account is secure and fully activated, please take a moment to verify your email address.</p>
<p>Click the link below to verify your email:</p>
<a href="${verificationLink}">Verify Email</a>
<p>If you didn't request this, don't worry—just ignore this email, and your account will remain unchanged.</p>
<p>Thank you for choosing [YourAppName]. We're here to help if you have any questions or need assistance.</p>
<p>Best regards,</p>
<p>Khelmandu Team</p>
  `
    );

    // Fetch created user without sensitive fields
    const createdUser: ISafeUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );
    if (!createdUser) {
      throw new ApiError(500, "Something went wrong while registering user");
    }

    // Send response
    return res.status(201).json(
      new ApiResponse(
        201,
        {
          token: { accessToken, refreshToken },
          user: {
            userId: user._id.toString(),
            email: user.email,
            username: user.username,
            phoneNumber: user.phoneNumber,
            image: user.image,
          },
        },
        "User registered successfully. Please check your email to verify your account"
      )
    );
  } catch (error) {
    console.error("Error registering user:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function verifyEmail(req: Request, res: Response): Promise<any> {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ message: "Verification token is required" });
  }

  const user = (await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: new Date() }, // Ensure token hasn't expired
  })) as IUser | null;

  if (!user) {
    return res
      .status(400)
      .json({ message: "Invalid or expired verification token" });
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = null;
  user.emailVerificationExpires = null;

  await user.save();

  res.status(200).json({ message: "Email successfully verified" });
}

// Login User Handler
export async function loginUser(req: Request, res: Response): Promise<any> {
  try {
    const { phoneNumber, password } = req.body;

    if (!phoneNumber || !password) {
      throw new ApiError(400, "Authentication failed");
    }

    const user = (await User.findOne({
      $or: [{ phoneNumber }],
    })) as IUser;

    if (!user) {
      throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid user credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user._id
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          token: { accessToken, refreshToken },
          userId: user._id.toString(), // Use directly without creating a new object
        },
        "User logged in successfully"
      )
    );
  } catch (error) {
    console.log("Error logging in", error);
    return res.status(500).json({ message: "Error logging in" });
  }
}

export async function logoutUser(req: Request, res: Response): Promise<any> {
  try {
    const { userId } = req.body; // Assuming userId is sent in the request body

    if (!userId) {
      throw new ApiError(400, "User ID is required for logout");
    }

    // Validate if the userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new ApiError(400, "Invalid User ID format");
    }

    // Update the refreshToken field directly without triggering pre("save")
    const user = await User.findByIdAndUpdate(
      userId,
      { $unset: { refreshToken: "" } }, // Unset the refreshToken field
      { new: true } // Return the updated document
    );

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Respond with a success message
    return res
      .status(200)
      .json(new ApiResponse(200, null, "User logged out successfully"));
  } catch (error) {
    console.error("Error logging out:", error);
    return res.status(500).json({ message: "Error logging out" });
  }
}

export async function refreshToken(req: Request, res: Response): Promise<any> {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ error: "Refresh token is required" });
  }

  try {
    // Verify the refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET!
    ) as { _id: string };
    console.log(decoded);
    const user = (await User.findById(decoded._id)) as IUser;
    console.log(user);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ error: "Invalid refresh token" });
    }

    // Check if the refresh token is near expiry
    const tokenExp = (jwt.decode(refreshToken) as { exp: number }).exp * 1000;
    const timeLeft = tokenExp - Date.now();

    let newRefreshToken = refreshToken; // Default to the current token
    if (timeLeft < 5 * 60 * 1000) {
      // Less than 5 minutes remaining
      newRefreshToken = user.generateRefreshToken();

      user.refreshToken = newRefreshToken; // Update with new refresh token
      await user.save();
    }

    // Generate a new access token
    const accessToken = user.generateAccessToken();

    return res.status(200).json({
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    if ((error as Error).name === "TokenExpiredError") {
      return res
        .status(403)
        .json({ error: "Refresh token expired. Please log in again." });
    }
    return res.status(403).json({ error: "Invalid or expired refresh token" });
  }
}

export async function getUser(req: Request, res: Response): Promise<any> {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(500).json({ message: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Error fetching the user details" });
  }
}

export async function uploadProfilePic(
  req: Request,
  res: Response
): Promise<any> {
  try {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized request");
    }

    const userId = req.user._id; // Extract userId from the verified JWT

    if (!req.file) {
      throw new ApiError(400, "No file uploaded");
    }

    // Upload the image to Cloudinary
    const localFilePath = req.file.path; // Path of the uploaded file
    const uploadResult = await uploadOnCloudinary(localFilePath);

    if (!uploadResult) {
      throw new ApiError(500, "Failed to upload image to Cloudinary");
    }

    // Update the user's profile picture URL in the database
    const updatedUser: ISafeUser = await User.findByIdAndUpdate(
      userId,
      { image: uploadResult.secure_url },
      { new: true } // Return the updated document
    ).select("-password -refreshToken"); // Exclude sensitive fields

    if (!updatedUser) {
      throw new ApiError(404, "User not found");
    }

    return res.status(200).json({
      message: "Profile picture updated successfully",
      user: updatedUser, // Send the safe user object
    });
  } catch (error) {
    console.error(
      `Error uploading profile picture for user ${req.user?._id || "unknown"}:`,
      error
    );

    // Handle known and unknown errors
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function requestPasswordReset(
  req: Request,
  res: Response
): Promise<any> {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Generate a reset token
  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // Token valid for 15 minutes

  await user.save();

  // Send the token via email
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  await sendEmail(
    user.email,
    "Password Reset Link",
    `
    <h4>Hi ${user.username},</h4>
    <p>You requested to reset your password. Click the link below to reset it:</p>
    <a href="${resetLink}">Reset Password</a>
    <p>If you didn't request this, please ignore this email.</p>
  `
  );

  res.status(200).json({ message: "Password reset link sent to your email" });
}

export async function resetPassword(req: Request, res: Response): Promise<any> {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res
      .status(400)
      .json({ message: "Token and new password are required" });
  }

  const user = (await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: new Date() },
  })) as IUser | null;

  if (!user) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }

  // Hash and update the password
  user.password = newPassword;
  user.resetPasswordToken = null; // Clear the reset token
  user.resetPasswordExpires = null;

  await user.save();

  res.status(200).json({ message: "Password has been reset successfully" });
}
