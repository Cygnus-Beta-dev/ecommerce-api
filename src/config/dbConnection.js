import mongoose from "mongoose";
import config from "./config.js";

const dbConnect = async () => {
  if (!config.mongodbUri) {
    console.error(
      "Database connection string is undefined. Check your environment variables.",
    );
    process.exit(1);
  }
  try {
    const mongodbConnect = await mongoose.connect(config.mongodbUri);
    console.log(`Database connected: ${mongodbConnect.connection.host}`);
  } catch (error) {
    console.log(`Database connection failed: ${error}`);
    process.exit(1);
  }
};

export default dbConnect;
