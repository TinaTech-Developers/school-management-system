import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import AcademicYear from "@/models/AcademicYear";

/* ========================= */
/* CREATE ACADEMIC YEAR */
/* ========================= */
export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();
    const { name, startDate, endDate, terms } = body;

    /* ------------------ */
    /* BASIC VALIDATION   */
    /* ------------------ */

    if (!name || !startDate || !endDate) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 },
      );
    }

    if (!Array.isArray(terms) || terms.length === 0) {
      return NextResponse.json(
        { message: "At least one term is required" },
        { status: 400 },
      );
    }

    const yearStart = new Date(startDate);
    const yearEnd = new Date(endDate);

    if (yearStart >= yearEnd) {
      return NextResponse.json(
        { message: "Invalid academic year date range" },
        { status: 400 },
      );
    }

    /* ------------------ */
    /* VALIDATE TERMS     */
    /* ------------------ */

    for (const term of terms) {
      if (!term.name || !term.startDate || !term.endDate) {
        return NextResponse.json(
          { message: "All term fields are required" },
          { status: 400 },
        );
      }

      const termStart = new Date(term.startDate);
      const termEnd = new Date(term.endDate);

      if (termStart >= termEnd) {
        return NextResponse.json(
          { message: `Invalid date range in term ${term.name}` },
          { status: 400 },
        );
      }

      // Ensure term is within academic year
      if (termStart < yearStart || termEnd > yearEnd) {
        return NextResponse.json(
          { message: `Term ${term.name} must be inside academic year range` },
          { status: 400 },
        );
      }
    }

    /* ------------------ */
    /* CHECK DUPLICATE    */
    /* ------------------ */

    const existing = await AcademicYear.findOne({ name });

    if (existing) {
      return NextResponse.json(
        { message: "Academic year already exists" },
        { status: 409 },
      );
    }

    /* ------------------ */
    /* AUTO STATUS LOGIC  */
    /* ------------------ */

    const now = new Date();
    let status: "UPCOMING" | "ACTIVE" | "COMPLETED" = "UPCOMING";

    if (now >= yearStart && now <= yearEnd) {
      status = "ACTIVE";
    } else if (now > yearEnd) {
      status = "COMPLETED";
    }

    /* ------------------ */
    /* CREATE DOCUMENT    */
    /* ------------------ */

    const academicYear = await AcademicYear.create({
      name,
      startDate: yearStart,
      endDate: yearEnd,
      status,
      terms,
    });

    return NextResponse.json(academicYear, { status: 201 });
  } catch (error: any) {
    console.error("CREATE ACADEMIC YEAR ERROR:", error);

    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

/* ========================= */
/* GET ALL ACADEMIC YEARS   */
/* ========================= */
export async function GET() {
  try {
    await connectDB();

    const academicYears = await AcademicYear.find().sort({ createdAt: -1 });

    return NextResponse.json(academicYears);
  } catch (error: any) {
    console.error("GET ACADEMIC YEARS ERROR:", error);

    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
