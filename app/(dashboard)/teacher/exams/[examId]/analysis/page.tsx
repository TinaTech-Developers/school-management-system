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
      console.log("SUBJECTS:", json);
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

      <div className="bg-white p-6 rounded-2xl shadow-lg w-full space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text font-bold text-gray-800">Subject Performance</h2>
          <span className="text-sm text-gray-500">
            {data.subjects?.length ?? 0} subjects analyzed
          </span>
        </div>

        {/* Subject Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.subjects && data.subjects.length > 0 ?
            data.subjects.map((s: any, i: number) => {
              const average = Number(s.average ?? s.avg ?? s.averageScore ?? 0);
              const highest = Number(s.highest ?? s.max ?? 0);
              const lowest = Number(s.lowest ?? s.min ?? 0);
              const passCount = Number(s.passCount ?? 0);
              const failCount = Number(s.failCount ?? 0);
              return (
                <div
                  key={i}
                  className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl shadow-sm"
                >
                  <h3 className="font-semibold text-gray-700 mb-2">
                    {s.name || "Unknown"}
                  </h3>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-500">Average</p>
                    <p className="font-semibold text-gray-800">
                      {average.toFixed(1)}%
                    </p>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-500">Highest</p>
                    <p className="font-semibold text-gray-800">
                      {highest.toFixed(1)}%
                    </p>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-500">Lowest</p>
                    <p className="font-semibold text-gray-800">
                      {lowest.toFixed(1)}%
                    </p>
                  </div>
                  <div className="mt-3 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-400"
                      style={{
                        width: `${passCount + failCount > 0 ? (passCount / (passCount + failCount)) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Pass: {passCount}</span>
                    <span>Fail: {failCount}</span>
                  </div>
                </div>
              );
            })
          : <p className="text-gray-400 italic col-span-full text-center py-20">
              No subject data available
            </p>
          }
        </div>

        {/* Optional Bar Chart */}
        <div className="mt-6 bg-white p-4 rounded-xl shadow-sm">
          <h3 className="font-semibold mb-4 text-gray-700">
            Average Scores Chart
          </h3>
          {data.subjects && data.subjects.length > 0 ?
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={data.subjects.map((s: any) => ({
                  name: s.name || "Unknown",
                  average: Number(s.average ?? s.avg ?? s.averageScore ?? 0),
                }))}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "#4B5563" }}
                />
                <YAxis tick={{ fontSize: 12, fill: "#4B5563" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#F9FAFB",
                    borderRadius: "8px",
                    border: "1px solid #E5E7EB",
                    padding: "8px",
                  }}
                />
                <Bar
                  dataKey="average"
                  fill="url(#barGradient)"
                  radius={[6, 6, 0, 0]}
                  barSize={30}
                />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366F1" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#A78BFA" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          : <p className="text-gray-400 italic text-center py-10">
              No chart data available
            </p>
          }
        </div>
      </div>
      <StudentTable title="Top Students" data={data.topStudents} />
      <StudentTable title="Risk Students" data={data.riskStudents} />
    </div>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow items-center text-center justify-center flex flex-col">
      <p className="text-sm text-gray-500">{title}</p>
      <p className=" font-semibold">{value}</p>
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
              <td className="text-sm ">{s.name}</td>
              <td className="text-sm ">{s.average.toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
