import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { User } from "@/models/User";
import { connectDB } from "@/lib/db";

async function migratePasswords() {
  await connectDB();

  // Find users with passwords not hashed (we assume plain text < 60 chars)
  const users = await User.find().lean();
  let updatedCount = 0;

  for (const user of users) {
    // If password is already hashed by bcrypt, it starts with $2
    if (!user.password.startsWith("$2")) {
      const hashed = await bcrypt.hash(user.password, 10);
      await User.updateOne({ _id: user._id }, { password: hashed });
      updatedCount++;
      console.log(`Updated password for ${user.email}`);
    }
  }

  console.log(`✅ Finished. Updated ${updatedCount} users.`);
  process.exit(0);
}

migratePasswords().catch((err) => {
  console.error(err);
  process.exit(1);
});
