import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";

import { verifyAdmin } from "@/lib/rbac";
import { AuditLog } from "@/models/uditLog";

export async function GET(req: Request) {
  await connectDB();

  const admin = await verifyAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const logs = await AuditLog.find()
    .populate("performedBy", "name role")
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  return NextResponse.json(logs);
}
