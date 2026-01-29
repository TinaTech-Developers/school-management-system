import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import bcrypt from "bcryptjs";
import { User } from "@/models/User";
import { connectDB } from "@/lib/db";

export async function POST(req: NextRequest) {
  await connectDB();

  const token = await getToken({ req });
  if (!token?.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { currentPassword, newPassword } = await req.json();

  const user = await User.findById(token.sub);
  if (!user || !user.password) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const match = await bcrypt.compare(currentPassword, user.password);
  if (!match) {
    return NextResponse.json(
      { error: "Incorrect current password" },
      { status: 400 },
    );
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  return NextResponse.json({ success: true });
}
