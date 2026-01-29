import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Fee } from "@/models/Fee";
import { verifyStudent, verifyParent, verifyAdmin } from "@/lib/rbac";
import type { JWT } from "next-auth/jwt";

type Params = { id: string };

/* =========================
   GET FEES BY STUDENT ID
========================= */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<Params> },
) {
  try {
    await connectDB();
    const { id: studentId } = await params;

    const studentToken = await verifyStudent(req);
    const parentToken = await verifyParent(req);
    const adminToken = await verifyAdmin(req);

    if (studentToken instanceof NextResponse) return studentToken;
    if (parentToken instanceof NextResponse) return parentToken;
    if (adminToken instanceof NextResponse) return adminToken;

    if (studentToken && (studentToken as JWT).sub !== studentId) {
      return NextResponse.json(
        { error: "Unauthorized. Students can only access their own fees." },
        { status: 403 },
      );
    }

    if (parentToken && (parentToken as JWT).childId !== studentId) {
      return NextResponse.json(
        { error: "Unauthorized. Parents can only access their child's fees." },
        { status: 403 },
      );
    }

    const fees = await Fee.find({ studentId })
      .populate("classId", "name")
      .lean();

    return NextResponse.json(fees);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/* =========================
   POST PAYMENT
========================= */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<Params> },
) {
  try {
    await connectDB();
    const { id: studentId } = await params;
    const { amount, method, reference } = await req.json();

    if (!amount || !method) {
      return NextResponse.json(
        { error: "Payment amount and method are required." },
        { status: 400 },
      );
    }

    const studentToken = await verifyStudent(req);
    const parentToken = await verifyParent(req);
    const adminToken = await verifyAdmin(req);

    if (studentToken instanceof NextResponse) return studentToken;
    if (parentToken instanceof NextResponse) return parentToken;
    if (adminToken instanceof NextResponse) return adminToken;

    if (studentToken) {
      return NextResponse.json(
        { error: "Unauthorized. Students cannot make payments." },
        { status: 403 },
      );
    }

    if (parentToken && (parentToken as JWT).childId !== studentId) {
      return NextResponse.json(
        { error: "Unauthorized. Parents can only pay for their child." },
        { status: 403 },
      );
    }

    const fee = await Fee.findOne({ studentId });
    if (!fee) {
      return NextResponse.json(
        { error: "Fee record not found." },
        { status: 404 },
      );
    }

    fee.paymentHistory.push({
      amount,
      method,
      date: new Date(),
      reference: reference || "",
    });

    fee.paidAmount += amount;
    fee.status =
      fee.paidAmount >= fee.amount ? "PAID"
      : fee.paidAmount > 0 ? "PARTIAL"
      : "PENDING";

    await fee.save();

    return NextResponse.json(fee);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/* =========================
   UPDATE FEE (ADMIN)
========================= */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<Params> },
) {
  const admin = await verifyAdmin(req);
  if (admin instanceof NextResponse) return admin;

  await connectDB();
  const { id } = await params;
  const body = await req.json();

  const updated = await Fee.findByIdAndUpdate(id, body, { new: true }).lean();
  if (!updated) {
    return NextResponse.json({ error: "Fee not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

/* =========================
   DELETE FEE (ADMIN)
========================= */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<Params> },
) {
  const admin = await verifyAdmin(req);
  if (admin instanceof NextResponse) return admin;

  await connectDB();
  const { id } = await params;

  const deleted = await Fee.findByIdAndDelete(id).lean();
  if (!deleted) {
    return NextResponse.json({ error: "Fee not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Fee deleted successfully" });
}
