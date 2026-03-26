



import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");
  } catch (error) {
    console.log("MongoDB Error:", error);
    process.exit(1);
  }
};