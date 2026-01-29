import { Student } from "@/models/Student";
import { Result } from "@/models/Result";
import { Exam } from "@/models/Exam";
import { Subject } from "@/models/Subject";
import { ReportCardData } from "../types/report-card";

function scoreToGrade(score: number) {
  if (score >= 80) return { grade: "A", gpa: 4 };
  if (score >= 70) return { grade: "B", gpa: 3 };
  if (score >= 60) return { grade: "C", gpa: 2 };
  if (score >= 50) return { grade: "D", gpa: 1 };
  return { grade: "F", gpa: 0 };
}

export async function buildReportCardData(
  studentId: string,
  examId: string,
): Promise<ReportCardData> {
  const student = await Student.findById(studentId).populate("classId", "name");
  if (!student) throw new Error("Student not found");

  const exam = await Exam.findById(examId);
  if (!exam) throw new Error("Exam not found");

  const results = await Result.find({ studentId, examId })
    .populate("examSubjectId", "name")
    .lean();

  const mappedResults = results.map((r) => {
    const { grade, gpa } = scoreToGrade(r.score);
    return {
      subject: (r.examSubjectId as any).name,
      score: r.score,
      grade,
      gpa,
      remarks: r.remarks || "",
    };
  });

  const gpa =
    mappedResults.reduce((s, r) => s + r.gpa, 0) / mappedResults.length;

  return {
    student: {
      id: student._id.toString(),
      name: student.name,
      className: (student.classId as any).name,
      rollNumber: student.rollNumber,
    },
    exam: {
      id: exam._id.toString(),
      name: exam.name,
      term: exam.term,
      year: exam.year,
    },
    results: mappedResults,
    gpa: Number(gpa.toFixed(2)),
  };
}
