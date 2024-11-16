import mongoose, { Schema } from "mongoose";

const gameSchema = new mongoose.Schema(
  {
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
      enum: ["public", "private"],
      default: "public",
    },
    totalPlayers: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
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
    queries: {
      type: [
        {
          question: String,
          answer: String,
        },
      ],
      default: [],
    },
    requests: {
      type: [
        {
          userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },
          comment: String,
        },
      ],
      default: [],
    },
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
  },
  { timestamps: true }
);

gameSchema.index({ sport: 1, area: 1, date: 1 });
const Game = mongoose.model("Game", gameSchema);
export default Game;
