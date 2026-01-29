"use client";

import { useState } from "react";
import clsx from "clsx";

const STATUS = ["PRESENT", "LATE", "ABSENT"];

export default function AttendanceTab() {
  const [records, setRecords] = useState<any[]>([]);

  function mark(id: string, status: string) {
    setRecords((prev) =>
      prev.map((r) => (r._id === id ? { ...r, status } : r)),
    );
  }

  return (
    <div className="bg-white border rounded-xl p-6">
      <h2 className="text-lg font-semibold mb-4">Attendance</h2>

      {records.map((r) => (
        <div
          key={r._id}
          className="flex justify-between items-center border rounded-lg p-3 mb-2"
        >
          <span>{r.name}</span>
          <div className="flex gap-2">
            {STATUS.map((s) => (
              <button
                key={s}
                onClick={() => mark(r._id, s)}
                className={clsx(
                  "px-3 py-1 text-xs rounded",
                  r.status === s ? "bg-blue-600 text-white" : "bg-gray-100",
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
