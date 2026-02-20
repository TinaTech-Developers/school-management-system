"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Student {
  _id: string;
  name: string;
  avatar?: string;
  email?: string;
  phone?: string;
  role?: string;
  schoolName?: string;
  createdAt?: string;
  updatedAt?: string;
  className?: string;
  parent?: {
    name: string;
    phone?: string;
    email?: string;
  };
  subjects?: string[];
}

export default function StudentProfilePage() {
  const params = useParams();
  const studentId =
    Array.isArray(params.studentId) ? params.studentId[0] : params.studentId;

  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) return;

    const fetchStudent = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/students/${studentId}`, {
          credentials: "include",
        });
        const data = await res.json();
        setStudent(data);
      } catch (err) {
        setStudent(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [studentId]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-gray-500 text-lg animate-pulse">
          Loading student profile...
        </p>
      </div>
    );

  if (!student)
    return (
      <div className="flex items-center justify-center h-[60vh] text-red-500">
        Student not found
      </div>
    );

  const initials = student.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Profile Card */}
        <div className="bg-white shadow-xl rounded-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-32 relative">
            <div className="absolute -bottom-14 left-8">
              {student.avatar ?
                <img
                  src={student.avatar}
                  alt={student.name}
                  className="w-28 h-28 rounded-full border-4 border-white object-cover shadow-md"
                />
              : <div className="w-28 h-28 rounded-full border-4 border-white bg-indigo-600 text-white flex items-center justify-center text-3xl font-bold shadow-md">
                  {initials}
                </div>
              }
            </div>
          </div>

          {/* Body */}
          <div className="pt-16 pb-8 px-8">
            <h1 className="text-xl font-bold text-gray-800">{student.name}</h1>
            <p className="text-sm text-gray-500 mt-1">
              <span className="font-semibold text-gray-800">Student ID:</span>{" "}
              {student._id}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              <span className="font-semibold text-gray-800">Role:</span>{" "}
              {student.role || "STUDENT"}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              <span className="font-semibold text-gray-800">School:</span>{" "}
              {student.schoolName || "-"}
            </p>

            {/* Info Section */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1 space-y-4">
                <div className="bg-gray-50 p-5 rounded-xl border">
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-sm font-medium text-gray-800 mt-1">
                    {student.email || "-"}
                  </p>
                </div>
                <div className="bg-gray-50 p-5 rounded-xl border">
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="text-sm font-medium text-gray-800 mt-1">
                    {student.phone || "-"}
                  </p>
                </div>
                <div className="bg-gray-50 p-5 rounded-xl border">
                  <p className="text-sm text-gray-500">Class</p>
                  <p className="text-sm font-medium text-gray-800 mt-1">
                    {student.className || "-"}
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 p-5 rounded-xl border">
                <p className="text-sm text-gray-500">Subjects</p>
                <p className="text-sm font-medium text-gray-800 mt-1">
                  {student.subjects?.length ? student.subjects.join(", ") : "-"}
                </p>
              </div>
            </div>

            {/* Parent Info */}
            {student.parent && (
              <div className="mt-8 p-5 bg-gray-50 rounded-xl border">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                  Parent Info
                </h2>
                <p className="text-sm text-gray-500">
                  Name: {student.parent.name}
                </p>
                <p className="text-sm text-gray-500">
                  Email: {student.parent.email || "-"}
                </p>
                <p className="text-sm text-gray-500">
                  Phone: {student.parent.phone || "-"}
                </p>
              </div>
            )}

            {/* Metadata */}
            <div className="mt-8 flex flex-wrap gap-4 text-gray-500 text-sm">
              <p>
                Created:{" "}
                {student.createdAt ?
                  new Date(student.createdAt).toLocaleDateString()
                : "-"}
              </p>
              <p>
                Updated:{" "}
                {student.updatedAt ?
                  new Date(student.updatedAt).toLocaleDateString()
                : "-"}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex gap-4">
              <button className="px-6 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition">
                Edit Profile
              </button>
              <button className="px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition">
                View Results
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
