import {
  getBookings,
  acceptBooking,
  rejectBooking,
} from "@src/controllers/booking.controllers.js";
import { Router } from "express";
import { verifyJWT } from "@middlewares/verifyJWT.middleware.js";
import { verifyVenueOwner } from "@src/middlewares/verifyVenueOwner.middleware.js";

const router = Router();

router.patch("/:bookingId/accept", verifyJWT, verifyVenueOwner, acceptBooking);

router.patch("/:bookingId/reject", verifyJWT, verifyVenueOwner, rejectBooking);

router.get("/", verifyJWT, verifyVenueOwner, getBookings);

export default router;
