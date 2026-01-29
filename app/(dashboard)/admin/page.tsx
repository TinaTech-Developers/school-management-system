"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FiUsers,
  FiBook,
  FiClipboard,
  FiLayers,
  FiDollarSign,
} from "react-icons/fi";

interface FeeStats {
  collectedThisMonth: number;
  collectedLastMonth: number;
  trend: number;
  pending: number;
}

interface Stats {
  users: number;
  classes: number;
  subjects: number;
  exams: number;
  results: number;
  fees: FeeStats;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    users: 0,
    classes: 0,
    subjects: 0,
    exams: 0,
    results: 0,
    fees: {
      collectedThisMonth: 0,
      collectedLastMonth: 0,
      trend: 0,
      pending: 0,
    },
  });

  const [loading, setLoading] = useState(true);

  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/admin/activities")
      .then((r) => r.json())
      .then(setActivities);
  }, []);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/stats"); // You need to create this API
        const data: Stats = await res.json();
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) return <p className="p-6">Loading dashboard...</p>;

  const cards = [
    {
      name: "Users",
      value: stats.users,
      icon: <FiUsers size={24} />,
      link: "/admin/users",
    },
    {
      name: "Classes",
      value: stats.classes,
      icon: <FiBook size={24} />,
      link: "/admin/classes",
    },
    {
      name: "Subjects",
      value: stats.subjects,
      icon: <FiLayers size={24} />,
      link: "/admin/subjects",
    },
    {
      name: "Exams",
      value: stats.exams,
      icon: <FiClipboard size={24} />,
      link: "/admin/exams",
    },
    {
      name: "Results",
      value: stats.results,
      icon: <FiClipboard size={24} />,
      link: "/admin/results",
    },
    {
      name: "Pending Fees",
      value: stats.fees.pending,
      icon: <FiDollarSign size={24} />,
      link: "/admin/fees",
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-black">Admin Dashboard</h1>
      <p className="text-gray-600">
        Welcome back! Here's a quick overview of your school ERP.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <Link
            key={card.name}
            href={card.link}
            className="bg-white rounded-lg shadow p-6 flex items-center gap-4 hover:shadow-lg transition"
          >
            <div className="p-3 bg-blue-500 text-white rounded-full">
              {card.icon}
            </div>
            <div>
              <p className="text-xl font-semibold">{card.value}</p>
              <p className="text-gray-500">{card.name}</p>
            </div>
          </Link>
        ))}

        <Link
          href="/admin/fees"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500 text-white rounded-full">
              <FiDollarSign size={24} />
            </div>

            <div>
              <p className="text-xl font-semibold">
                ${stats.fees.collectedThisMonth}
              </p>
              <p className="text-gray-500">Collected This Month</p>

              {/* 👇 TREND INDICATOR GOES HERE */}
              <p
                className={`text-sm ${
                  stats.fees.trend >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {stats.fees.trend >= 0 ? "↑" : "↓"} $
                {Math.abs(stats.fees.trend)} vs last month
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Activities Placeholder */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">
          Recent Activities
        </h2>
        <ul className="space-y-2 text-gray-700">
          {activities.map((a) => (
            <li key={a._id}>
              <span className="font-medium">{a.performedBy?.name}</span>{" "}
              {a.description}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
