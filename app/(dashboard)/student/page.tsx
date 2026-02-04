"use client";

import { useEffect, useState } from "react";
import {
  FiBookOpen,
  FiClipboard,
  FiTrendingUp,
  FiDollarSign,
} from "react-icons/fi";
import { motion } from "framer-motion";

interface Assignment {
  _id: string;
  title: string;
  dueDate: string;
}

interface Announcement {
  _id: string;
  title: string;
}

interface Stats {
  classes: number;
  assignmentsDue: number;
  attendance: number;
  fees: number;
}

export default function StudentDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    classes: 0,
    assignmentsDue: 0,
    attendance: 0,
    fees: 0,
  });

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [
          classesRes,
          assignmentsRes,
          attendanceRes,
          feesRes,
          announcementsRes,
        ] = await Promise.all([
          fetch("/api/student/classes"),
          fetch("/api/student/assignments?status=due"),
          fetch("/api/student/attendance"),
          fetch("/api/student/fees"),
          fetch("/api/student/announcements"),
        ]);

        const classesData: any[] = await classesRes.json();
        const assignmentsData: Assignment[] = await assignmentsRes.json();
        const attendanceData: { attendancePct: number } =
          await attendanceRes.json();
        const feesData = await feesRes.json();

        const announcementsData: Announcement[] = await announcementsRes.json();

        setStats({
          classes: classesData?.length || 0,
          assignmentsDue: assignmentsData?.length || 0,
          attendance: attendanceData?.attendancePct || 0,
          fees: feesData.outstandingFees || 0,
        });

        setAssignments(assignmentsData.slice(0, 5));
        setAnnouncements(announcementsData.slice(0, 5));
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const statCards = [
    {
      label: "My Classes",
      value: stats.classes,
      icon: FiBookOpen,
      color: "bg-indigo-100 text-indigo-600",
    },
    {
      label: "Assignments Due",
      value: stats.assignmentsDue,
      icon: FiClipboard,
      color: "bg-orange-100 text-orange-600",
    },
    {
      label: "Attendance",
      value: `${stats.attendance}%`,
      icon: FiTrendingUp,
      color: "bg-green-100 text-green-600",
    },
    {
      label: "Outstanding Fees",
      value: `$${stats.fees}`,
      icon: FiDollarSign,
      color: "bg-red-100 text-red-600",
    },
  ];

  if (loading) {
    return <p className="text-gray-500">Loading dashboard…</p>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Student Dashboard</h2>
        <p className="text-sm text-gray-500">
          Overview of your academic progress and school activities
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-xl p-4 border shadow-sm hover:shadow-md transition"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">{s.label}</p>
                <p className="text-2xl font-bold mt-1">{s.value}</p>
              </div>
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}
              >
                <s.icon size={20} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Upcoming Assignments & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Assignments */}
        <div className="bg-white rounded-xl p-5 border shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-3">
            Upcoming Assignments
          </h3>

          {assignments.length === 0 ?
            <p className="text-sm text-gray-500">No pending assignments</p>
          : <div className="space-y-3">
              {assignments.map((a) => (
                <div key={a._id} className="flex justify-between text-sm">
                  <span className="text-gray-600">{a.title}</span>
                  <span className="text-orange-600 font-medium">
                    Due {new Date(a.dueDate).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          }
        </div>

        {/* Announcements */}
        <div className="bg-white rounded-xl p-5 border shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-3">Announcements</h3>

          {announcements.length === 0 ?
            <p className="text-sm text-gray-500">No announcements</p>
          : <ul className="space-y-2 text-sm text-gray-600">
              {announcements.map((a) => (
                <li key={a._id}>📢 {a.title}</li>
              ))}
            </ul>
          }
        </div>
      </div>
    </div>
  );
}
