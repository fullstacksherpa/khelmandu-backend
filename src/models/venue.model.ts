import mongoose, { Schema } from "mongoose";
import { IVenue } from "@src/types/venueInterface.js";

const venueSchema = new Schema<IVenue>(
  {
    name: { type: String, required: true },
    location: {
      type: { type: String, enum: ["Point"], required: true },
      coordinates: { type: [Number], required: true }, // [longitude, latitude]
    },
    phone: { type: Number, required: true },
    defaultSchedule: {
      openingTime: { type: String, required: true },
      closingTime: { type: String, required: true },
      pricing: [
        {
          from: { type: String, required: true }, // Time slot start
          to: { type: String, required: true }, // Time slot end
          price: { type: Number, required: true }, // Price for this time slot
        },
      ],
    },
    customSchedule: {
      type: Map,
      of: new Schema({
        openingTime: { type: String, required: true },
        closingTime: { type: String, required: true },
      }),
      required: false,
    },
    sportsAvailable: [
      {
        name: { type: String, required: true },
        defaultPrice: { type: Number },
        courts: [
          {
            courtName: { type: String, required: true },
            courtNumber: { type: Number, required: true },
          },
        ],
      },
    ],
    images: [{ type: String }],
    address: { type: String, required: true },
    iframeLink: { type: String },
    bookings: [
      {
        type: Schema.Types.ObjectId,
        ref: "Booking",
      },
    ], // Array of Booking references
    amenities: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Amenity",
      },
    ],
    subscription: {
      isSubscribed: { type: Boolean, default: false },
      isPremium: { type: Boolean, default: false },
    },
    lastUpdatedAt: { type: Date, default: Date.now },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// GeoJSON index for location
venueSchema.index({ location: "2dsphere" });

// Export the Venue model
const Venue = mongoose.model<IVenue>("Venue", venueSchema);
export default Venue;
