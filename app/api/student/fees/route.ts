import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Fee } from "@/models/Fee";
import { verifyStudent } from "@/lib/rbac";
import type { JWT } from "next-auth/jwt";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const token = await verifyStudent(req);
    if (token instanceof NextResponse) return token;

    const studentId = (token as JWT).sub;

    const fees = await Fee.find({ studentId }).lean();

    const totalAmount = fees.reduce((sum, f) => sum + f.amount, 0);
    const paidAmount = fees.reduce((sum, f) => sum + f.paidAmount, 0);

    return NextResponse.json({
      totalAmount,
      paidAmount,
      outstandingFees: totalAmount - paidAmount,
      fees,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
