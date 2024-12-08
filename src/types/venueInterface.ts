import mongoose, { Document } from "mongoose";

// Define types for the schedule
interface ISchedule {
  openingTime: string;
  closingTime: string;
  pricing: {
    from: string; // Time slot start
    to: string; // Time slot end
    price: number; // Price for this time slot
  }[];
}

// Define types for court and sport
interface ICourt {
  courtName: string;
  courtNumber: number;
}

interface ISport {
  name: string;
  defaultPrice?: number;
  courts: ICourt[];
}

// Define the IVenue interface
export interface IVenue extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  location: {
    type: "Point"; // GeoJSON type
    coordinates: [number, number]; // [longitude, latitude]
  };
  phone: number;
  defaultSchedule: ISchedule; // Updated to include pricing
  customSchedule?: Map<
    string,
    {
      openingTime: string;
      closingTime: string;
    }
  >;
  sportsAvailable: ISport[];
  images: string[];
  address: string;
  iframeLink?: string;
  bookings: mongoose.Types.ObjectId[];
  amenities: mongoose.Types.ObjectId[];
  lastUpdatedAt: Date;
  subscription: {
    isSubscribed: boolean;
    isPremium: boolean;
  };
  owner: mongoose.Types.ObjectId;
}
