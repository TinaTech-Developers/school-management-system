import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Department } from "@/models/Department";
import { User } from "@/models/User";

export async function GET() {
  await connectDB();

  try {
    // ✅ Populate the `head` reference to get full user document
    const departments = await Department.find().populate("head");

    const data = departments.map((dept) => ({
      _id: dept._id,
      name: dept.name,
      description: dept.description || "",
      schoolId: dept.schoolId,
      head:
        dept.head ?
          {
            _id: (dept.head as any)._id,
            name: (dept.head as any).name,
            email: (dept.head as any).email,
            role: (dept.head as any).role,
          }
        : null,
      createdAt: dept.createdAt,
    }));

    return NextResponse.json(data);
  } catch (err) {
    console.error("Error fetching departments:", err);
    return NextResponse.json(
      { error: "Failed to fetch departments" },
      { status: 500 },
    );
  }
}

// POST handler to create a new department
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const { name, description, head, schoolId } = body;

    if (!name || !schoolId) {
      return NextResponse.json(
        { error: "Name and schoolId are required" },
        { status: 400 },
      );
    }

    const newDept = await Department.create({
      name,
      description,
      head: head || null,
      schoolId,
    });

    return NextResponse.json(
      { success: true, department: newDept },
      { status: 201 },
    );
  } catch (err) {
    console.error("Error creating department:", err);
    return NextResponse.json(
      { error: "Failed to create department" },
      { status: 500 },
    );
  }
}
