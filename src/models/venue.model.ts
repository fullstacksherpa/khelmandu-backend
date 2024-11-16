import mongoose, { Schema } from "mongoose";

const venueSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  rating: Number,
  image: String,
  image1: String,
  image2: String,
  deferLink: String,
  fullLink: String,
  avgRating: Number,
  ratingCount: Number,
  lat: Number,
  lng: Number,
  icon: String,
  filter_by: [String],
  sportsAvailable: [
    {
      id: String,
      name: String,
      icon: String,
      price: Number,
      courts: [
        {
          id: String,
          name: String,
          number: Number,
        },
      ],
    },
  ],
  location: String,
  address: {
    type: String,
    required: true,
  },
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
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      game: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Game",
      },
    },
  ], // Array of bookings
});

const Venue = mongoose.model("Venue", venueSchema);

export default Venue;
