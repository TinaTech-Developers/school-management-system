import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { School } from "@/models/School";
import { verifyAdmin } from "@/lib/rbac";

export async function GET(req: Request) {
  try {
    await connectDB();

    const schools = await School.find().sort({ name: 1 });

    return NextResponse.json(schools);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch schools" },
      { status: 500 }
    );
  }
}

// POST add new school
export async function POST(req: Request) {
  const admin = await verifyAdmin(req);
  if (admin instanceof NextResponse) return admin; // unauthorized, stop

  try {
    const { name, address, phone, email } = await req.json();

    if (!name || !address || !phone || !email) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const school = await School.create({
      name,
      address,
      phone,
      email,
      adminId: admin!.sub, // ⚡ use the token’s sub (user ID)
    });

    return NextResponse.json(school, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create school" },
      { status: 500 }
    );
  }
}
