  "use client";

  import { useEffect, useState } from "react";
  import { saveAs } from "file-saver";
  import * as XLSX from "xlsx";
  import Link from "next/link";

  interface Student {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  }

  interface Class {
    _id: string;
    name: string;
  }

  interface Subject {
    _id: string;
    name: string;
    classId: string;
    teacherId: string;
  }

  interface AttendanceRecord {
    studentId: string;
    status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
    remarks?: string;
  }

  const STATUS_OPTIONS = ["PRESENT", "ABSENT", "LATE", "EXCUSED"] as const;

  export default function TeacherAttendanceModule() {
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
    const [classes, setClasses] = useState<Class[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [selectedClass, setSelectedClass] = useState("");
    const [selectedSubject, setSelectedSubject] = useState("");
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [saving, setSaving] = useState(false);
    const [isLocked, setIsLocked] = useState(false);

    // Analytics
    const totalStudents = records.length;
    const presentCount = records.filter((r) => r.status === "PRESENT").length;
    const absentCount = records.filter((r) => r.status === "ABSENT").length;
    const lateCount = records.filter((r) => r.status === "LATE").length;
    const excusedCount = records.filter((r) => r.status === "EXCUSED").length;
    const getPercentage = (count: number) =>
      totalStudents > 0 ? ((count / totalStudents) * 100).toFixed(1) : "0";

    // Fetch classes
    useEffect(() => {
      fetch("/api/classes")
        .then((res) => res.json())
        .then((data) =>
          setClasses(Array.isArray(data) ? data : data.classes || []),
        )
        .catch(() => setClasses([]));
    }, []);

    // Fetch subjects
    useEffect(() => {
      if (!selectedClass) {
        setSubjects([]);
        setSelectedSubject("");
        return;
      }

      fetch(`/api/teacher/subjects?classId=${selectedClass}`)
        .then((res) => res.json())
        .then((data) =>
          setSubjects(Array.isArray(data) ? data : data.subjects || []),
        )
        .catch(() => setSubjects([]))
        .finally(() => setSelectedSubject(""));
    }, [selectedClass]);

    // Fetch students and existing attendance
    useEffect(() => {
      if (!selectedClass || !selectedSubject) {
        setStudents([]);
        setRecords([]);
        return;
      }

      setLoadingStudents(true);

      const loadStudents = async () => {
        try {
          const studentRes = await fetch(
            `/api/students?classId=${selectedClass}&subjectId=${selectedSubject}`,
          );
          const studentData = await studentRes.json();
          const fetchedStudents: Student[] =
            Array.isArray(studentData) ? studentData : studentData.students || [];

          setStudents(fetchedStudents);

          // Just set default records
          setRecords(
            fetchedStudents.map((s) => ({
              studentId: s._id,
              status: "PRESENT",
              remarks: "",
            })),
          );
        } catch (err) {
          console.error(err);
          setStudents([]);
          setRecords([]);
        } finally {
          setLoadingStudents(false);
        }
      };

      loadStudents();
    }, [selectedClass, selectedSubject]);

    // Update status
    const updateStatus = (
      studentId: string,
      status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED",
    ) => {
      setRecords((prev) =>
        prev.map((r) => (r.studentId === studentId ? { ...r, status } : r)),
      );
    };

    // Update remarks
    const updateRemarks = (studentId: string, remarks: string) => {
      setRecords((prev) =>
        prev.map((r) => (r.studentId === studentId ? { ...r, remarks } : r)),
      );
    };

    // Save attendance
    const saveAttendance = async () => {
      if (!selectedClass || !selectedSubject) {
        return alert("Select class & subject");
      }

      setSaving(true);
      try {
        const res = await fetch("/api/teacher/attendance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            classId: selectedClass,
            slotId: selectedSubject, // make sure this is correct
            date,
            attendance: records, // must match backend field
          }),
        });

        const data = await res.json();
        console.log(data); // ✅ debug any errors

        if (data.success) {
          alert("Attendance saved!");
        } else {
          alert(data.error || "Error saving attendance");
        }
      } catch (err) {
        console.error(err);
        alert("Error saving attendance");
      } finally {
        setSaving(false);
      }
    };

    // Export Excel
    const exportExcel = () => {
      const worksheet = XLSX.utils.json_to_sheet(
        records.map((r) => {
          const student = students.find((s) => s._id === r.studentId);
          return {
            Name: student?.name || "",
            Email: student?.email || "",
            Status: r.status,
            Remarks: r.remarks || "",
          };
        }),
      );

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
      const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      saveAs(new Blob([wbout]), `Attendance_${date}.xlsx`);
    };

    return (
      <div className="p-8 max-w-6xl mx-auto space-y-6">
        <h1 className="text-xl font-bold text-gray-800">Teacher Attendance</h1>

        <div className="flex items-center gap-4 flex-wrap bg-gray-100 p-6 md:p-10 shadow-lg rounded-lg text-gray-600 text-sm">
          <label className="font-semibold">Date:</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border px-3 py-1 rounded"
          />

          <label className="font-semibold">Class:</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="border px-3 py-1 rounded"
          >
            <option value="">Select class</option>
            {classes.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          <label>Subject:</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            disabled={!subjects.length}
            className="border px-3 py-1 rounded"
          >
            <option value="">Select subject</option>
            {subjects.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Analytics Dashboard */}
          {records.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
              <div className="bg-white shadow rounded-lg p-4 text-center">
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-xl font-bold">{totalStudents}</p>
              </div>

              <div className="bg-green-100 rounded-lg p-4 text-center">
                <p className="text-sm">Present</p>
                <p className="font-bold text-green-700">
                  {presentCount} ({getPercentage(presentCount)}%)
                </p>
              </div>

              <div className="bg-red-100 rounded-lg p-4 text-center">
                <p className="text-sm">Absent</p>
                <p className="font-bold text-red-700">
                  {absentCount} ({getPercentage(absentCount)}%)
                </p>
              </div>

              <div className="bg-yellow-100 rounded-lg p-4 text-center">
                <p className="text-sm">Late</p>
                <p className="font-bold text-yellow-700">
                  {lateCount} ({getPercentage(lateCount)}%)
                </p>
              </div>

              <div className="bg-blue-100 rounded-lg p-4 text-center">
                <p className="text-sm">Excused</p>
                <p className="font-bold text-blue-700">
                  {excusedCount} ({getPercentage(excusedCount)}%)
                </p>
              </div>
            </div>
          )}
        </div>

        {loadingStudents ?
          <p className="text-gray-700">Loading students...</p>
        : records.length === 0 ?
          <p className="text-gray-500">No students found for this selection.</p>
        : <table className="w-full border border-gray-300 rounded-lg text-sm text-left mt-4">
            <thead className="bg-gray-50 border-b border-gray-300">
              <tr>
                <th className="py-2 px-3 border-b border-gray-300 text-gray-700">
                  Student
                </th>
                <th className="py-2 px-3 border-b border-gray-300 text-gray-700">
                  Status
                </th>
                <th className="py-2 px-3 border-b border-gray-300 text-gray-700">
                  Remarks
                </th>
              </tr>
            </thead>

            <tbody>
              {records.map((r) => {
                const student = students.find((s) => s._id === r.studentId);
                return (
                  <tr
                    key={r.studentId}
                    className="border-b border-gray-300 last:border-none"
                  >
                    <td className="py-2 px-3 text-gray-700">
                      {student?.name || "Unknown Student"}
                    </td>
                    <td className="py-2 px-3">
                      <select
                        value={r.status}
                        onChange={(e) =>
                          updateStatus(
                            r.studentId,
                            e.target.value as
                              | "PRESENT"
                              | "ABSENT"
                              | "LATE"
                              | "EXCUSED",
                          )
                        }
                        disabled={isLocked}
                        className="border rounded px-2 py-1 text-gray-700"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={r.remarks || ""}
                        onChange={(e) =>
                          updateRemarks(r.studentId, e.target.value)
                        }
                        disabled={isLocked}
                        className="border border-gray-300 rounded px-2 py-1 w-full text-gray-700"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        }

        {records.length > 0 && (
          <div className="flex gap-4 mt-4">
            <button
              type="button"
              onClick={saveAttendance}
              disabled={saving || isLocked}
              className="bg-indigo-600 text-white px-6 py-2 text-sm rounded hover:bg-indigo-700"
            >
              {saving ? "Saving..." : "Save Attendance"}
            </button>

            <button
              type="button"
              onClick={exportExcel}
              className="bg-green-600 text-white px-6 py-2 text-sm rounded hover:bg-green-700"
            >
              Export Excel
            </button>

            {!isLocked && (
              <button
                type="button"
                onClick={async () => {
                  try {
                    await fetch("/api/attendance/lock", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        classId: selectedClass,
                        slotId: selectedSubject,
                        date,
                      }),
                    });
                    alert("Attendance locked");
                    setIsLocked(true);
                  } catch (err) {
                    console.error(err);
                    alert("Failed to lock attendance");
                  }
                }}
                className="bg-red-600 text-white px-6 py-2 rounded-sm text-sm hover:bg-red-700"
              >
                Lock Attendance
              </button>
            )}
            <Link
              href="/teacher/attendance/attendance-history"
              className="ml-4 text-blue-600 text-center bg-gray-300 rounded-sm px-6 py-2 text-sm hover:bg-gray-400"
            >
              Attendance History
            </Link>
          </div>
        )}
      </div>
    );
  }
