import { ApiError } from "@utils/ApiError.js";
import { asyncHandler } from "@utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import User from "@src/models/user.model.js";
import "dotenv/config";
import { ISafeUser, JwtAccessTokenPayload } from "@src/types";

export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    // Retrieve token from the Authorization header
    const authHeader = req.header("Authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.replace("Bearer ", "")
      : null;

    if (!token) {
      throw new ApiError(401, "Unauthorized request: Token missing");
    }

    // Verify the token
    const decodedToken = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string
    ) as JwtAccessTokenPayload;

    // Fetch user from the database
    const user: ISafeUser | null = await User.findById(decodedToken._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "Unauthorized request: Invalid access token");
    }

    // Attach the user object to the request for subsequent middleware or handlers
    req.user = user;

    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error("JWT Verification Error:", error);
    throw new ApiError(401, "Unauthorized request: Invalid token");
  }
});
