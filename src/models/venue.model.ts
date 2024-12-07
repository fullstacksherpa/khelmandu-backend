import mongoose, { Document, ObjectId, Schema } from "mongoose";

// Define types for the venue schema
interface ISchedule {
  openingTime: string;
  closingTime: string;
}

interface ITimeSlot {
  day: string;
  from: string;
  to: string;
  customPrice?: number;
}

interface ICourt {
  courtName: string;
  courtNumber: number;
}

interface ISport {
  id: string;
  name: string;
  defaultPrice?: number;
  courts: ICourt[];
  timeSlots: ITimeSlot[];
}

// Booking interface
interface IBooking {
  courtNumber: string;
  date: string;
  time: string;
  user: ObjectId;
  game?: ObjectId;
}

export interface IVenue extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  lat: number;
  lng: number;
  phone: number;
  defaultSchedule: ISchedule;
  customSchedule: Map<string, ISchedule>;
  sportsAvailable: ISport[];
  images: string[];
  address: string;
  iframeLink?: string;
  bookings: IBooking[];
  amenities: mongoose.Types.ObjectId[];
  lastUpdatedAt: Date;
  subscription: {
    isSubscribed: boolean;
    isPremium: boolean;
  };
  owner?: mongoose.Types.ObjectId;
}

// TimeSlot Schema
const timeSlotSchema = new Schema({
  day: {
    type: String,
    enum: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    required: true,
  },
  from: { type: String, required: true },
  to: { type: String, required: true },
  customPrice: { type: Number },
});

// Venue Schema
const venueSchema = new Schema<IVenue>(
  {
    name: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    phone: { type: Number, required: true },
    defaultSchedule: {
      openingTime: { type: String, required: true },
      closingTime: { type: String, required: true },
    },
    customSchedule: {
      type: Map,
      of: new Schema({
        openingTime: { type: String, required: true },
        closingTime: { type: String, required: true },
      }),
    },
    sportsAvailable: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        defaultPrice: { type: Number },
        courts: [
          {
            courtName: { type: String, required: true },
            courtNumber: { type: Number, required: true },
          },
        ],
        timeSlots: [timeSlotSchema],
      },
    ],
    images: [{ type: String }],
    address: { type: String, required: true },
    iframeLink: { type: String },
    bookings: [
      {
        courtNumber: {
          type: String,
          required: true,
        },
        date: {
          type: String,
          required: true,
        },
        time: {
          type: String,
          required: true,
        },
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        game: {
          type: Schema.Types.ObjectId,
          ref: "Game",
        },
      },
    ], // Array
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
    },
  },
  { timestamps: true }
);

const Venue = mongoose.model<IVenue>("Venue", venueSchema);
export default Venue;
