export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(req: Request) {
  await connectDB();

  const session = await getServerSession(authOptions);

  if (!session?.user?.schoolId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const roles = searchParams.get("roles")?.split(",") || ["ADMIN", "TEACHER"];

  const users = await User.find({
    role: { $in: roles },
    schoolId: session.user.schoolId,
  }).select("_id name email role");

  return NextResponse.json(users);
}
