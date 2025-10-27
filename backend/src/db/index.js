import mongoose from "mongoose";
import { ApiError } from "../utils/api-error.js";

// mongoose.connect(process.env.MONGO_URI)
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new ApiError(
        500,
        "❌ MongoDB connection string (MONGO_URI) is missing!",
        []
      );
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Database connected");
    console.log("Loaded MONGO_URI:", process.env.MONGO_URI);
  } catch (error) {
    console.error("❌ MONGO DB connection error ", error);
    process.exit(1);
  }
};
export default connectDB;
