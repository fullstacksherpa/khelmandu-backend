import { Request, Response } from "express";
import User from "@src/models/user.model.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { ApiError } from "@src/utils/ApiError";
import { CustomMulterRequest, IUser } from "@src/types/index.js";
import { uploadOnCloudinary } from "@src/utils/cloudinary";
import { ApiResponse } from "@src/utils/ApiResponse";

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
export async function registerUser(
  req: CustomMulterRequest,
  res: Response
): Promise<any> {
  try {
    const { email, password, firstName, lastName, phoneNumber } = req.body;
    if (
      [email, password, firstName, lastName, phoneNumber].some(
        (field) => field?.trim() === ""
      )
    ) {
      throw new ApiError(400, "All Fields are required");
    }

    const existedUser = await User.findOne({
      $or: [{ phoneNumber }, { email }],
    });
    if (existedUser) {
      throw new ApiError(409, "User with email or phone number already exists");
    }
    // Check if files and the image array are defined
    const avatarFiles = req.files?.image;

    // Ensure the avatar file is present
    if (!avatarFiles || avatarFiles.length === 0) {
      throw new ApiError(400, "Avatar file is required");
    }

    const avatarLocalPath = avatarFiles[0].path;
    const image = await uploadOnCloudinary(avatarLocalPath);
    if (!image) {
      throw new ApiError(409, "avatar file is required");
    }

    const user = (await User.create({
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      image: image.url,
    })) as IUser;

    const createdUser: IUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );
    if (!createdUser) {
      throw new ApiError(500, "something went wrong while registering user");
    }

    const { accessToken } = await generateAccessAndRefreshTokens(
      user._id as ObjectId
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          accessToken,
          user: {
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phoneNumber: user.phoneNumber,
            image: user.image,
          },
        },
        "User logged in successfully"
      )
    );
  } catch (error) {
    console.log("Error creating user", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Login User Handler
export async function loginUser(req: Request, res: Response): Promise<any> {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email" });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const secretKey = crypto.randomBytes(32).toString("hex");
    const token = jwt.sign({ userId: user._id }, secretKey);

    return res.status(200).json({ token });
  } catch (error) {
    console.log("Error logging in", error);
    return res.status(500).json({ message: "Error logging in" });
  }
}
