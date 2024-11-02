import { ApiError } from "@utils/ApiError.js";
import { asyncHandler } from "@utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import User from "@src/models/user.model.js";
import "dotenv/config";
import { JwtAccessTokenPayload } from "@src/types";

export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    // Retrieve token from the Authorization header
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string
    ) as JwtAccessTokenPayload;

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    req.user = user; // Attach the user object to the request
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    throw new ApiError(401, "Invalid access token");
  }
});
