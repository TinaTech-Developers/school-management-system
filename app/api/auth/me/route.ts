import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/rbac";

export async function GET(req: NextRequest) {
  const token = await verifyAuth(req);
  if (token instanceof NextResponse) return token;

  return NextResponse.json({
    _id: token.sub,
    role: token.role,
  });
}
