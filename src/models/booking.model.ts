import mongoose, { Schema } from "mongoose";

const BookingSchema = new mongoose.Schema(
  {
    courtNumber: { type: Number, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    game: { type: Schema.Types.ObjectId, ref: "Game" },
    venue: {
      type: Schema.Types.ObjectId,
      ref: "Venue",
      required: true,
    },
    paid: { type: Boolean, default: false },
    amount: { type: Number, required: true },
    paymentDetails: {
      transactionId: { type: String },
      method: { type: String },
      paidAt: { type: Date },
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
    _skipValidation: { type: Boolean, default: false },
  },
  { timestamps: true }
);

BookingSchema.pre("save", async function (next) {
  if (!this.isNew) return next(); // Skip validation for updates
  if (this._skipValidation) return next(); // Skip if explicitly allowed

  // Check for conflicting bookings
  const conflict = await mongoose.models.Booking.findOne({
    venue: this.venue,
    courtNumber: this.courtNumber,
    startTime: { $lt: this.endTime },
    endTime: { $gt: this.startTime },
    status: { $ne: "cancelled" },
  });
  if (conflict) {
    return next(new Error("Time slot conflict for this court and venue."));
  }

  // Validate user and venue references
  const [user, venue] = await Promise.all([
    mongoose.models.User.findById(this.user),
    mongoose.models.Venue.findById(this.venue),
  ]);
  if (!user) return next(new Error("User not found."));
  if (!venue) return next(new Error("Venue not found."));

  next();
});

BookingSchema.index({ venue: 1 });
BookingSchema.index({ user: 1 });
BookingSchema.index({ game: 1 });

const Booking = mongoose.model("Booking", BookingSchema);
export default Booking;
