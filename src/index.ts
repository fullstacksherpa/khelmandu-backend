import "dotenv/config";
import connectDB from "@db/index.js";
import { app } from "@src/app.js";

// Start the application
const startServer = async (): Promise<void> => {
  try {
    await connectDB();

    const port = process.env.PORT || 8000;
    app.listen(port, () => {
      console.log(`Server is running at port: http://localhost:${port}`);
    });
  } catch (err) {
    console.log("MongoDB connection failed!!!", err);
  }
};

// Call the function to start the server
startServer();
