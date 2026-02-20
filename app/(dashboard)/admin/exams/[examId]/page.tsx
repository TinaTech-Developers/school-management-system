"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Exam {
  _id: string;
  name: string;
  term: string;
  startDate?: string;
  endDate?: string;
}

interface AssignedSubject {
  _id: string;
  className: string;
  subjectName: string;
  teacherName: string;
  totalMarks: number;
  passMarks: number;
}

export default function ExamDetailsPage() {
  const { examId } = useParams();
  const router = useRouter();

  const [exam, setExam] = useState<Exam | null>(null);
  const [assignedSubjects, setAssignedSubjects] = useState<AssignedSubject[]>(
    [],
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [examRes, subjectsRes] = await Promise.all([
          fetch(`/api/admin/exams/${examId}`),
          fetch(`/api/admin/exams/${examId}/subjects`),
        ]);

        if (!examRes.ok || !subjectsRes.ok) throw new Error("Failed to load");

        const examData = await examRes.json();
        const subjectsData = await subjectsRes.json();

        setExam(examData);
        setAssignedSubjects(subjectsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [examId]);

  if (loading)
    return <p className="p-6 text-gray-600">Loading exam details...</p>;

  if (!exam) return <p className="p-6 text-red-500">Exam not found.</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-gray-600 max-w-5xl mx-auto">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">{exam.name}</h1>
          <p className="text-sm text-gray-500">
            {exam.term} |{" "}
            {exam.startDate ?
              new Date(exam.startDate).toLocaleDateString()
            : "N/A"}{" "}
            -{" "}
            {exam.endDate ? new Date(exam.endDate).toLocaleDateString() : "N/A"}
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href={`/admin/exams/${exam._id}/assign-subject`}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Assign Subject
          </Link>

          <Link
            href={`/admin/exams/${exam._id}/edit`}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Edit Exam
          </Link>
        </div>
      </div>

      {/* ASSIGNED SUBJECTS TABLE */}
      <div className="bg-white border rounded-xl shadow-sm overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium">Class</th>
              <th className="px-6 py-3 text-left text-sm font-medium">
                Subject
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium">
                Teacher
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium">
                Total Marks
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium">
                Pass Marks
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {assignedSubjects.length === 0 ?
              <tr>
                <td colSpan={5} className="text-center p-4 text-gray-500">
                  No subjects assigned yet.
                </td>
              </tr>
            : assignedSubjects.map((sub) => (
                <tr key={sub._id} className="hover:bg-gray-50">
                  <td className="px-6 py-3">{sub.className}</td>
                  <td className="px-6 py-3">{sub.subjectName}</td>
                  <td className="px-6 py-3">{sub.teacherName}</td>
                  <td className="px-6 py-3">{sub.totalMarks}</td>
                  <td className="px-6 py-3">{sub.passMarks}</td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}
