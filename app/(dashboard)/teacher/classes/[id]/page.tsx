"use client";

import { useState } from "react";
import clsx from "clsx";
import { motion } from "framer-motion";
import AttendanceTab from "../_components/AttendanceTab";
import ReportsTab from "../_components/ReportsTap";
import StudentsTab from "../_components/StudentsTab";

const TABS = ["Overview", "Students", "Attendance", "Reports"] as const;

export default function ClassDetailsPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-700">Class Dashboard</h1>

      {/* Tabs */}
      <div className="flex gap-3 border-b text-gray-600">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={clsx(
              "px-4 py-2 font-medium relative",
              tab === t && "text-blue-600",
            )}
          >
            {t}
            {tab === t && (
              <motion.div
                layoutId="tab"
                className="absolute left-0 right-0 bottom-0 h-0.5 bg-blue-600"
              />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <motion.div
        key={tab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-gray-500"
      >
        {tab === "Overview" && (
          <div className="bg-white rounded-xl border p-6">
            <p className="text-gray-500">
              Class performance summary coming here.
            </p>
          </div>
        )}
        {tab === "Students" && <StudentsTab />}
        {tab === "Attendance" && <AttendanceTab />}
        {tab === "Reports" && <ReportsTab />}
      </motion.div>
    </div>
  );
}
