import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema(
  {
    courtNumber: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    game: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Game",
    },
    venue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Venue",
      required: true,
    },
    paid: {
      type: Boolean,
      default: false,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentDetails: {
      transactionId: { type: String }, // To track payment.
      method: { type: String }, // Payment method, e.g., "Credit Card", "Cash".
      paidAt: { type: Date }, // Timestamp when payment was processed.
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", BookingSchema);
