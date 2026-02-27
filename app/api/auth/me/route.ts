// /app/api/auth/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/rbac";

export async function GET(req: NextRequest) {
  const token = await verifyAuth(req); // verifyAuth returns token info or NextResponse
  if (token instanceof NextResponse) return token;

  return NextResponse.json({
    _id: token.sub,
    role: token.role,
    schoolId: token.schoolId, // ✅ include schoolId
    name: token.name,
    email: token.email,
  });
}
