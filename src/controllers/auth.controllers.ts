import { Request, Response } from "express";
import User from "@src/models/user.model.js";
import { ObjectId } from "mongodb";
import { ApiError } from "@src/utils/ApiError";
import { CustomMulterRequest, IUser } from "@src/types/index.js";
import { uploadOnCloudinary } from "@src/utils/cloudinary";
import { ApiResponse } from "@src/utils/ApiResponse";
import { asyncHandler } from "@src/utils/asyncHandler";

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
    const avatarFiles = (
      req.files as { [fieldname: string]: Express.Multer.File[] }
    )?.image;

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
    const { phoneNumber, password } = req.body;

    if (!(phoneNumber || password)) {
      throw new ApiError(400, "Authentication failed");
    }

    const user = await User.findOne({
      $or: [{ phoneNumber }],
    });

    if (!user) {
      throw new ApiError(404, "User does not exit");
    }

    //here we are using user which is instance of found user and not model(User). we are calling method declare in that user.
    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid user credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user._id as ObjectId
    );

    const loginUser = {
      ...user.toObject(), // Convert to a plain object
      password: undefined,
      refreshToken: undefined,
    };

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          user: loginUser,
          accessToken,
          refreshToken,
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
    // Invalidate the user's refresh token in the database
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          refreshToken: undefined,
        },
      },
      { new: true }
    );

    // Respond to the client with a success message
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "User logged out successfully"));
  } catch (error) {
    console.log("Error logging out user", error);
    return res.status(500).json({ message: "Error logging out user" });
  }

  // Note for the client:
  // In the React Native app, after receiving this response,
  // you should remove the tokens from MMKV storage like this:
  // MMKV.removeItem('accessToken');
  // MMKV.removeItem('refreshToken');
}
