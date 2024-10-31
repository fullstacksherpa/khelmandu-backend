import "dotenv/config";
import mongoose from "mongoose";
import { DB_NAME } from "../constants";

const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error(
        "MongoDB connection URI is not defined in environment variables."
      );
    }

    mongoose.set("strictQuery", true);

    // Connect to MongoDB
    const connectionInstance = await mongoose.connect(`${mongoUri}`);

    console.log(
      `\n MongoDB connected successfully ✅ || DB HOST: ${connectionInstance.connection.host}`
    );
  } catch (error: any) {
    console.error("❌ MONGODB connection error:", error.message);
    process.exit(1);
  }
};

export default connectDB;
