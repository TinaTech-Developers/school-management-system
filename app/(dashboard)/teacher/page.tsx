"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FiUsers,
  FiBook,
  FiClipboard,
  FiLayers,
  FiCheckCircle,
} from "react-icons/fi";

interface Stats {
  classes: number;
  students: number;
  exams: number;
  attendancePending: number;
  resultsPending: number;
  resultsTrend: number; // New: trend vs last period
  attendanceTrend: number; // New
}

interface ExamEvent {
  id: string;
  name: string;
  date: string;
  className: string;
}

export default function TeacherDashboard() {
  const [stats, setStats] = useState<Stats>({
    classes: 0,
    students: 0,
    exams: 0,
    attendancePending: 0,
    resultsPending: 0,
    resultsTrend: 0,
    attendanceTrend: 0,
  });

  const [upcomingExams, setUpcomingExams] = useState<ExamEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const resStats = await fetch("/api/teacher/stats");
        const data: Stats = await resStats.json();
        setStats(data);

        const resExams = await fetch("/api/teacher/upcoming-exams");
        const exams: ExamEvent[] = await resExams.json();
        setUpcomingExams(exams);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  if (loading) return <p className="p-6 text-gray-500">Loading dashboard...</p>;

  const cards = [
    {
      name: "Classes",
      value: stats.classes,
      icon: <FiBook size={24} />,
      link: "/teacher/classes",
      color: "bg-indigo-500",
    },
    {
      name: "Students",
      value: stats.students,
      icon: <FiUsers size={24} />,
      link: "/teacher/students",
      color: "bg-green-500",
    },
    {
      name: "Exams",
      value: stats.exams,
      icon: <FiClipboard size={24} />,
      link: "/teacher/exams",
      color: "bg-yellow-500",
    },
    {
      name: "Attendance Pending",
      value: stats.attendancePending,
      icon: <FiCheckCircle size={24} />,
      link: "/teacher/attendance",
      color: "bg-red-500",
      trend: stats.attendanceTrend,
    },
    {
      name: "Results Pending",
      value: stats.resultsPending,
      icon: <FiLayers size={24} />,
      link: "/teacher/results",
      color: "bg-purple-500",
      trend: stats.resultsTrend,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Welcome back! Here's your teaching overview with quick stats and
          actions.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {cards.map((card) => (
          <Link
            key={card.name}
            href={card.link}
            className="bg-white shadow-md rounded-xl p-5 flex flex-col justify-between hover:shadow-xl transition duration-300"
          >
            <div className="flex items-center justify-between">
              <div
                className={`p-3 rounded-full text-white ${card.color} flex items-center justify-center`}
              >
                {card.icon}
              </div>
              {card.trend !== undefined && (
                <span
                  className={`text-sm font-medium ${
                    card.trend >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {card.trend >= 0 ? "↑" : "↓"} {Math.abs(card.trend)}
                </span>
              )}
            </div>
            <div className="mt-4">
              <p className="text-2xl font-semibold text-gray-900">
                {card.value}
              </p>
              <p className="text-gray-500 mt-1">{card.name}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        <Link
          href="/teacher/results/upload"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
        >
          Upload Results
        </Link>
        <Link
          href="/teacher/attendance"
          className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition"
        >
          Mark Attendance
        </Link>
        <Link
          href="/teacher/exams/create"
          className="bg-yellow-500 text-white px-4 py-2 rounded-lg shadow hover:bg-yellow-600 transition"
        >
          Create Exam
        </Link>
      </div>

      {/* Upcoming Exams */}
      <div className="bg-white rounded-xl shadow p-5">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Upcoming Exams
        </h2>
        {upcomingExams.length === 0 ?
          <p className="text-gray-500">No upcoming exams scheduled.</p>
        : <ul className="divide-y divide-gray-200">
            {upcomingExams.map((exam) => (
              <li key={exam.id} className="py-2 flex justify-between">
                <span>
                  {exam.name} ({exam.className})
                </span>
                <span className="text-gray-400">
                  {new Date(exam.date).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        }
      </div>
    </div>
  );
}
