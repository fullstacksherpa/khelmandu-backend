import "dotenv/config";
import connectDB from "@db/index.js";
import { app } from "@src/app";

// Start the application
const startServer = async (): Promise<void> => {
  try {
    await connectDB();

    const port = process.env.PORT || 8000;
    app.listen(port, () => {
      console.log(`Server is running at port: http://localhost:${port}`);
      console.log(
        "if you want to add venue then uncomment populateVenues() at index.ts"
      );
    });
    // await populateVenues();
  } catch (err) {
    console.log("MongoDB connection failed!!!", err);
  }
};

// Call the function to start the server
startServer();
