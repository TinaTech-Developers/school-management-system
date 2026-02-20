import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { ExamResult } from "@/models/ExamResult";
import { User } from "@/models/User";
import {
  ExamAnalysisResponse,
  SubjectChart,
  ClassPerf,
  StudentPerf,
} from "@/types/examAnalysis";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ examId: string }> },
) {
  await connectDB();

  const { examId } = await params;
  const objectId = new mongoose.Types.ObjectId(examId);

  // Fetch all results for this exam and populate student names
  const results = await ExamResult.find({ examId: objectId }).populate(
    "studentId",
    "name",
  );

  // If no results, return empty response
  if (!results.length) {
    const empty: ExamAnalysisResponse = {
      summary: {
        averageScore: 0,
        highest: 0,
        lowest: 0,
        totalStudents: 0,
        passRate: 0,
        topStudentName: "",
        topStudentScore: 0,
      },
      subjects: [],
      classes: [],
      topStudents: [],
      riskStudents: [],
      subjectAnalysis: [], // ✅ add this
    };

    return NextResponse.json(empty);
  }

  // ---------------- CALCULATE SUMMARY ----------------
  const marks = results.map((r) => r.marks);
  const total = marks.reduce((a, b) => a + b, 0);
  const averageScore = total / marks.length;
  const highest = Math.max(...marks);
  const lowest = Math.min(...marks);
  const passCount = marks.filter((m) => m >= 50).length;
  const passRate = (passCount / marks.length) * 100;

  // ---------------- TOP STUDENT ----------------
  let topStudentName = "";
  let topStudentScore = 0;

  results.forEach((r) => {
    if (r.marks > topStudentScore) {
      topStudentScore = r.marks;
      topStudentName = (r.studentId as any)?.name ?? "";
    }
  });

  // ---------------- SUBJECT ANALYSIS ----------------
  const subjectsAgg = await ExamResult.aggregate([
    { $match: { examId: objectId } },
    {
      $group: {
        _id: "$examSubjectId",
        avg: { $avg: "$marks" },
      },
    },
  ]);

  const subjects: SubjectChart[] = subjectsAgg.map((s) => ({
    name: s._id.toString(), // TODO: Replace with actual subject name by joining ExamSubject collection
    average: s.avg,
  }));

  // ---------------- CLASS ANALYSIS ----------------
  // Placeholder: implement real aggregation using classId if needed
  const classes: ClassPerf[] = [];

  // ---------------- TOP & RISK STUDENTS ----------------
  const topStudents: StudentPerf[] = results
    .sort((a, b) => b.marks - a.marks)
    .slice(0, 5)
    .map((r) => ({
      name: (r.studentId as any)?.name ?? "",
      average: r.marks,
    }));

  const riskStudents: StudentPerf[] = results
    .sort((a, b) => a.marks - b.marks)
    .slice(0, 5)
    .map((r) => ({
      name: (r.studentId as any)?.name ?? "",
      average: r.marks,
    }));

  // ---------------- FINAL RESPONSE ----------------
  const response: ExamAnalysisResponse = {
    summary: {
      averageScore,
      highest,
      lowest,
      totalStudents: marks.length,
      passRate,
      topStudentName,
      topStudentScore,
    },
    subjects,
    classes,
    topStudents,
    riskStudents,
    subjectAnalysis: subjectsAgg, // ✅ aggregate result if you want
  };

  return NextResponse.json(response);
}
