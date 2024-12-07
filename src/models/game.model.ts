import mongoose from "mongoose";

const gameSchema = new mongoose.Schema(
  {
    sport: {
      type: String,
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },
    maxPlayers: {
      type: Number,
      required: true,
      min: 1,
      max: 50,
    },
    instruction: {
      type: String,
      maxLength: 600,
      default: "",
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    venue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Venue",
      required: true,
    },
    location: {
      type: { type: String, enum: ["Point"], required: true }, // GeoJSON Point
      coordinates: { type: [Number], required: true }, // [longitude, latitude]
    },
    players: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    chat: {
      type: [
        {
          sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },
          content: {
            type: String,
            required: true,
          },
          timestamp: {
            type: Date,
            default: Date.now,
          },
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
          requestedAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
    status: {
      type: String,
      enum: ["active", "cancelled", "completed"],
      default: "active",
    },
    cancellationReason: {
      type: String,
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

// Middleware for matchFull
gameSchema.pre("save", function (next) {
  this.matchFull = this.players.length >= this.maxPlayers;
  next();
});
gameSchema.index({ location: "2dsphere" });

gameSchema.index({ sport: 1, area: 1, startTime: 1 });
const Game = mongoose.model("Game", gameSchema);
export default Game;
