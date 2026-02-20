"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import {
  ExamAnalysisResponse,
  StudentPerf,
  ClassPerf,
  SubjectChart,
} from "@/types/examAnalysis";

export default function TeacherExamAnalysisPage() {
  const { examId } = useParams<{ examId: string }>();
  const [data, setData] = useState<ExamAnalysisResponse | null>(null);

  useEffect(() => {
    if (!examId) return;

    const load = async () => {
      const res = await fetch(`/api/teacher/exams/${examId}/analysis`);

      const json = await res.json();
      console.log("ANALYSIS RESPONSE:", json);

      if (!res.ok) {
        console.error("API ERROR:", json);
        return;
      }

      setData(json);
    };

    load();
  }, [examId]);

  if (!data) return <p className="p-6 text-gray-600">Loading...</p>;

  return (
    <div className="p-6 max-w-7xl mx-auto text-gray-600 space-y-8">
      <div className="grid grid-cols-5 gap-4">
        <Card
          title="Average Score"
          value={`${data.summary.averageScore.toFixed(1)}%`}
        />
        <Card title="Highest" value={`${data.summary.highest.toFixed(1)}%`} />
        <Card title="Lowest" value={`${data.summary.lowest.toFixed(1)}%`} />
        <Card title="Students" value={String(data.summary.totalStudents)} />
        <Card
          title="Top Student"
          value={`${data.summary.topStudentName} (${data.summary.topStudentScore?.toFixed(1)}%)`}
        />
      </div>

      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="font-semibold mb-4">Subject Performance</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.subjects}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="average" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <StudentTable title="Top Students" data={data.topStudents} />
      <StudentTable title="Risk Students" data={data.riskStudents} />
    </div>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}

function StudentTable({ title, data }: { title: string; data: StudentPerf[] }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="font-semibold mb-4">{title}</h2>
      <table className="w-full">
        <tbody>
          {data.map((s, i) => (
            <tr key={i}>
              <td>{s.name}</td>
              <td>{s.average.toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
