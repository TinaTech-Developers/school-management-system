import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { verifyAdmin } from "@/lib/rbac";
import bcrypt from "bcryptjs";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }, // ✅ App Router expects a Promise
) {
  try {
    await connectDB();
    const { id } = await context.params; // ✅ await the params

    const user = await User.findById(id).select("-password");
    if (!user)
      return NextResponse.json({ message: "User not found" }, { status: 404 });

    return NextResponse.json(user);
  } catch (err: any) {
    console.error("GET /api/users/[id] error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await verifyAdmin(req);
    if (admin instanceof NextResponse) return admin;

    await connectDB();
    const { id } = await context.params;

    const deleted = await User.findByIdAndDelete(id);
    if (!deleted)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({ message: "User deleted", user: deleted });
  } catch (err: any) {
    console.error("DELETE /api/users/[id] error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await verifyAdmin(req);
    if (admin instanceof NextResponse) return admin;

    await connectDB();
    const { id } = await context.params;
    const updates = await req.json();

    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const updated = await User.findByIdAndUpdate(id, updates, {
      new: true,
    }).select("-password");

    if (!updated)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("PATCH /api/users/[id] error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
