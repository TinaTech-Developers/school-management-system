import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

import { User } from "@/models/User";
import { connectDB } from "@/lib/db";

export async function GET(req: NextRequest) {
  await connectDB();

  const token = await getToken({ req });
  if (!token?.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await User.findById(token.sub)
    .select("name email role phone image createdAt")
    .lean();

  return NextResponse.json(user);
}

export async function PUT(req: NextRequest) {
  await connectDB();

  const token = await getToken({ req });
  if (!token?.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const updated = await User.findByIdAndUpdate(
    token.sub,
    {
      name: body.name,
      email: body.email,
      phone: body.phone,
    },
    { new: true },
  ).select("name email role phone image");

  return NextResponse.json(updated);
}
