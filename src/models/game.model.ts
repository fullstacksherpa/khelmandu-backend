import mongoose, { Schema } from "mongoose";

const gameSchema = new mongoose.Schema({
  sport: {
    type: String,
    required: true,
  },
  area: {
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
  activityAccess: {
    type: String,
    default: "public",
  },
  totalPlayers: {
    type: Number,
    required: true,
  },
  instruction: {
    type: String,
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  players: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  queries: [
    {
      question: String,
      answer: String,
    },
  ],
  requests: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      comment: {
        type: String,
      },
    },
  ],
  isBooked: {
    type: Boolean,
    default: false,
  },
  matchFull: {
    type: Boolean,
    default: false,
  },
  courtNumber: {
    type: String,
  },
});

const Game = mongoose.model("Game", gameSchema);
export default Game;
