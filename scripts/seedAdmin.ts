// scripts/seedAdmin.ts
import { connectDB } from "../lib/db";
import { User } from "../models/User"; // relative path
import bcrypt from "bcrypt";

async function seedAdmin() {
  try {
    await connectDB();
    console.log("Connected to database ✅");

    const hashed = await bcrypt.hash("admin123", 10);

    const adminExists = await User.findOne({
      email: "admin@tinisoftnexus.co.zw",
    });
    if (adminExists) {
      console.log("Admin already exists 👌");
      return process.exit(0);
    }

    const admin = await User.create({
      name: "TinaSoft Admin",
      email: "admin@tinisoftnexus.co.zw",
      password: hashed,
      role: "ADMIN",
      schoolId: "tinasoftnexus-id", // must exist in your School collection
    });

    console.log("Admin created ✅:", admin);
    process.exit(0);
  } catch (err) {
    console.error("Error seeding admin ❌:", err);
    process.exit(1);
  }
}

seedAdmin();
