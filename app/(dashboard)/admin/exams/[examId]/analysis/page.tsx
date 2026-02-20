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

/* ================= TYPES ================= */

interface Summary {
  averageScore: number;
  highest: number;
  lowest: number;
  totalStudents: number;
  passRate: number;
  topStudentName?: string;
  topStudentScore?: number;
}

interface SubjectChart {
  name: string;
  average: number;
}

interface ClassPerf {
  name: string;
  average: number;
}

interface StudentPerf {
  name: string;
  average: number;
}

interface ExamAnalysisResponse {
  summary: Summary;
  subjects: SubjectChart[];
  classes: ClassPerf[];
  topStudents: StudentPerf[];
  riskStudents: StudentPerf[];
}

/* ================= PAGE ================= */

export default function ExamAnalysisPage() {
  const { examId } = useParams<{ examId: string }>();

  const [data, setData] = useState<ExamAnalysisResponse | null>(null);

  useEffect(() => {
    if (!examId) return;

    const load = async () => {
      const res = await fetch(`/api/admin/exams/${examId}/analysis`);
      const json = await res.json();

      // Build safe data including top student
      const safeData: ExamAnalysisResponse = {
        summary: {
          averageScore: json?.summary?.averageScore ?? 0,
          highest: json?.summary?.highest ?? 0,
          lowest: json?.summary?.lowest ?? 0,
          totalStudents: json?.summary?.totalStudents ?? 0,
          passRate: json?.summary?.passRate ?? 0,
          topStudentName: json?.summary?.topStudentName ?? "N/A",
          topStudentScore: json?.summary?.topStudentScore ?? 0,
        },
        subjects: json?.subjects ?? [],
        classes: json?.classes ?? [],
        topStudents: json?.topStudents ?? [],
        riskStudents: json?.riskStudents ?? [],
      };

      setData(safeData);
    };

    load();
  }, [examId]);

  if (!data) return <p className="p-6 text-gray-600">Loading...</p>;

  return (
    <div className="p-6 max-w-7xl mx-auto text-gray-600 space-y-8">
      {/* SUMMARY */}
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

      {/* SUBJECT CHART */}
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

      {/* CLASS TABLE */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="font-semibold mb-4">Class Performance</h2>
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left">Class</th>
              <th className="text-left">Average</th>
            </tr>
          </thead>

          <tbody>
            {data.classes.map((c, i) => (
              <tr key={i}>
                <td>{c.name}</td>
                <td>{c.average.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <StudentTable title="Top Students" data={data.topStudents} />
      <StudentTable title="Risk Students" data={data.riskStudents} />
    </div>
  );
}

/* ================= COMPONENTS ================= */

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-xl font-semibold">{value}</p>
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
