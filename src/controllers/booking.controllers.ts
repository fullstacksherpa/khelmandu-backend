import Booking from "@src/models/booking.model.js";
import { ApiError } from "@src/utils/ApiError";
import { asyncHandler } from "@src/utils/asyncHandler";
import moment from "moment";

export const getBookings = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page as string) || 1; // Default to page 1
  const limit = parseInt(req.query.limit as string) || 10; // Default to 10 bookings per page
  const { venueId, status, paid, startDate, endDate, date, upcoming } =
    req.query as {
      venueId?: string;
      status?: string;
      paid?: string;
      startDate?: string;
      endDate?: string;
      date?: string;
      upcoming?: string;
    };

  // Calculate skip value for pagination
  const skip = (page - 1) * limit;

  // Build dynamic filters
  const filters: Record<string, any> = {};

  // Filter by venue (ensured by middleware)
  if (venueId) filters.venue = venueId;

  // Filter by booking status
  if (status) filters.status = status;

  // Filter by payment status
  if (paid !== undefined) filters.paid = paid === "true";

  // Filter by a single date
  if (date) {
    const startOfDay = moment(date).startOf("day").toDate();
    const endOfDay = moment(date).endOf("day").toDate();
    filters.startTime = { $gte: startOfDay, $lte: endOfDay };
  }

  // Filter by date range
  if (startDate && endDate) {
    const start = moment(startDate).startOf("day").toDate();
    const end = moment(endDate).endOf("day").toDate();
    filters.startTime = { $gte: start, $lte: end };
  }

  // Filter for upcoming bookings
  if (upcoming === "true") {
    filters.startTime = { $gte: new Date() };
    filters.status = { $in: ["pending", "confirmed"] }; // Only upcoming active bookings
  }

  // Fetch bookings with applied filters and pagination
  const bookings = await Booking.find(filters)
    .skip(skip)
    .limit(limit)
    .populate({
      path: "user",
      select: "_id username email phoneNumber image",
    })
    .populate({
      path: "game",
      select: "_id startTime endTime",
    })
    .sort({ startTime: 1 }); // Sort by start time

  // Format bookings for response
  const formattedBookings = bookings.map((booking) => ({
    user: booking.user,
    game: booking.game,
  }));

  // Total count for pagination metadata
  const total = await Booking.countDocuments(filters);

  res.status(200).json({
    message: "Bookings fetched successfully.",
    page,
    limit,
    total,
    bookings: formattedBookings,
  });
});

export const acceptBooking = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new ApiError(404, "Booking not found.");
  }

  booking.status = "confirmed";
  await booking.save();

  res.status(200).json({ message: "Booking accepted successfully.", booking });
});

export const rejectBooking = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new ApiError(404, "Booking not found.");
  }

  booking.status = "cancelled";
  await booking.save();

  res.status(200).json({ message: "Booking rejected successfully.", booking });
});
