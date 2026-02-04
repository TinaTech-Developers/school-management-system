"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface Class {
  _id: string;
  name: string;
  code: string;
  teacher: string;
  schedule: string;
  room?: string;
  status: "Active" | "Completed" | "Upcoming";
  subjects: string[];
}

export default function ClassesPage() {
  const [classes] = useState<Class[]>([
    {
      _id: "cls1",
      name: "Form 4 Science",
      code: "F4S01",
      teacher: "Mr. John Doe",
      schedule: "Mon, Wed, Fri - 8:00AM to 10:00AM",
      room: "Room 101",
      status: "Active",
      subjects: ["Mathematics", "Physics", "Chemistry", "Computer Science"],
    },
    {
      _id: "cls2",
      name: "Form 3 Arts",
      code: "F3A02",
      teacher: "Mrs. Jane Smith",
      schedule: "Tue, Thu - 9:00AM to 11:00AM",
      room: "Room 202",
      status: "Upcoming",
      subjects: ["History", "Geography", "English", "Art"],
    },
    {
      _id: "cls3",
      name: "Form 2 Commerce",
      code: "F2C03",
      teacher: "Mr. Peter Parker",
      schedule: "Mon, Wed - 1:00PM to 3:00PM",
      room: "Room 303",
      status: "Completed",
      subjects: ["Economics", "Business Studies", "Accounting"],
    },
  ]);

  return (
    <div className="w-full min-h-screen bg-gray-50 p-10">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">My Classes</h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {classes.map((cls) => (
          <motion.div
            key={cls._id}
            whileHover={{ y: -5 }}
            className="rounded-2xl border bg-white p-6 shadow-sm hover:shadow-lg transition"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {cls.name}
              </h2>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  cls.status === "Active" ? "bg-green-100 text-green-700"
                  : cls.status === "Upcoming" ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-600"
                }`}
              >
                {cls.status}
              </span>
            </div>

            <p className="text-sm text-gray-500 mb-2">Teacher: {cls.teacher}</p>
            <p className="text-sm text-gray-500 mb-2">
              Schedule: {cls.schedule}
            </p>
            {cls.room && (
              <p className="text-sm text-gray-500 mb-2">Room: {cls.room}</p>
            )}

            <div className="mt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Subjects
              </h3>
              <div className="flex flex-wrap gap-2">
                {cls.subjects.map((sub) => (
                  <span
                    key={sub}
                    className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700"
                  >
                    {sub}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
