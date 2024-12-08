import Venue from "@src/models/venue.model.js";
import { ApiError } from "@src/utils/ApiError";
import { asyncHandler } from "@src/utils/asyncHandler.js";

export const verifyVenueOwner = asyncHandler(async (req, res, next) => {
  const { venueId } = req.body; // Assuming venueId is sent in the request body or params
  const userId = req.user._id;

  // Fetch the venue and check ownership
  const venue = await Venue.findById(venueId);
  if (!venue) {
    throw new ApiError(404, "Venue not found.");
  }

  if (venue.owner.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not authorized to perform this action.");
  }

  // Venue ownership verified, proceed to the next middleware
  next();
});
