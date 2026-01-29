import mongoose from "mongoose";

export const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("❌ Missing MONGODB_URI environment variable");
  }

  try {
    await mongoose.connect(uri);
    console.log("✅ MongoDB Connected");
  } catch (error: any) {
    console.error("❌ MongoDB connection failed:", error.message);
  }
};
