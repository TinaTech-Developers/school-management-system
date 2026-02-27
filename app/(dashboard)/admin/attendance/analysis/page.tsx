"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

interface Overview {
  totalStudents: number;
  averageAttendance: number;
  present: number;
  absent: number;
  late: number;
}

export default function AttendanceAnalysisPage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [classComparison, setClassComparison] = useState<any[]>([]);
  const [distribution, setDistribution] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch("/api/admin/attendance/analysis");
        const data = await res.json();

        setOverview(data.overview);
        setMonthlyData(data.monthlyTrend);
        setClassComparison(data.classComparison);
        setDistribution(data.distribution);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-500">
        Loading attendance analytics...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8  min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-800">
          Attendance Analytics
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Historical performance and trends overview
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <StatCard title="Total Students" value={overview?.totalStudents} />
        <StatCard
          title="Average Attendance"
          value={`${overview?.averageAttendance}%`}
        />
        <StatCard title="Present" value={overview?.present} />
        <StatCard title="Absent" value={overview?.absent} />
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Monthly Trend */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border">
          <h2 className="text-sm font-semibold text-gray-600 mb-4">
            Monthly Attendance Trend
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="attendanceRate"
                stroke="#4f46e5"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Distribution */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border">
          <h2 className="text-sm font-semibold text-gray-600 mb-4">
            Attendance Distribution
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={distribution}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label
              >
                <Cell fill="#16a34a" />
                <Cell fill="#dc2626" />
                <Cell fill="#f59e0b" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Class Comparison */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border">
        <h2 className="text-sm font-semibold text-gray-600 mb-4">
          Class Attendance Comparison
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={classComparison}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="className" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="attendanceRate" fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function StatCard({ title, value }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border">
      <p className="text-xs text-gray-500 uppercase tracking-wide">{title}</p>
      <h2 className="text-2xl font-semibold text-gray-800 mt-2">
        {value ?? "-"}
      </h2>
    </div>
  );
}
