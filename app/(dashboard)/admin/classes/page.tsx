"use client";

import { useEffect, useState } from "react";
import { FiEdit2, FiPlus, FiTrash2, FiSearch } from "react-icons/fi";
import ClassModal from "./_components/ClassModal";
import Link from "next/link";

interface Class {
  _id: string;
  name: string;
  teacherId?: { _id: string; name: string };
  schoolId?: { _id: string; name: string };
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Class | null>(null);

  const fetchClasses = async () => {
    setLoading(true);
    const res = await fetch("/api/classes");
    const data = await res.json();
    setClasses(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const deleteClass = async (id: string) => {
    if (!confirm("Delete this class?")) return;
    await fetch(`/api/classes/${id}`, { method: "DELETE" });
    fetchClasses();
  };

  const filtered = classes.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Classes</h1>
          <p className="text-sm text-gray-500">
            Manage classes, assign teachers, and organize schools
          </p>
        </div>

        <Link
          href="/admin/classes/create"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium"
        >
          <FiPlus />
          New Class
        </Link>
      </div>

      {/* ================= SEARCH ================= */}
      <div className="relative max-w-md">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search classes by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-xl text-sm text-gray-600 outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        {loading ?
          <div className="p-8 text-center text-sm text-gray-500">
            Loading classes...
          </div>
        : filtered.length === 0 ?
          <div className="p-8 text-center text-sm text-gray-500">
            No classes found
          </div>
        : <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left font-medium text-gray-600">
                  Class
                </th>
                <th className="px-6 py-4 text-left font-medium text-gray-600">
                  Teacher
                </th>
                <th className="px-6 py-4 text-left font-medium text-gray-600">
                  School
                </th>
                <th className="px-6 py-4 text-right font-medium text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((cls) => (
                <tr
                  key={cls._id}
                  className="border-b last:border-none hover:bg-gray-50 transition"
                >
                  <td className="px-6 py-4 font-medium text-gray-800">
                    {cls.name}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {cls.teacherId?.name || "—"}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {cls.schoolId?.name || "—"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-3">
                      <Link
                        href={`/admin/classes/${cls._id}`}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit class"
                      >
                        <FiEdit2 />
                      </Link>
                      <button
                        onClick={() => deleteClass(cls._id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete class"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        }
      </div>

      {/* ================= MODAL ================= */}
      {open && (
        <ClassModal
          editing={editing}
          onClose={() => setOpen(false)}
          onSaved={fetchClasses}
        />
      )}
    </div>
  );
}

// "use client";

// import { useState, useEffect } from "react";
// import Toast from "../users/_components/Toast";

// interface School {
//   _id: string;
//   name: string;
// }

// interface Teacher {
//   _id: string;
//   name: string;
// }

// interface ClassType {
//   _id: string;
//   name: string;
//   teacherId?: { _id: string; name: string };
//   schoolId?: { _id: string; name: string };
// }

// export default function ClassesPage() {
//   const [classes, setClasses] = useState<ClassType[]>([]);
//   const [schools, setSchools] = useState<School[]>([]);
//   const [teachers, setTeachers] = useState<Teacher[]>([]);

//   const [name, setName] = useState("");
//   const [schoolId, setSchoolId] = useState("");
//   const [teacherId, setTeacherId] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [toast, setToast] = useState<{
//     message: string;
//     type: "success" | "error";
//   } | null>(null);

//   // Fetch all classes
//   async function fetchClasses() {
//     try {
//       const res = await fetch("/api/classes");
//       const data = await res.json();
//       setClasses(data);
//     } catch (err) {
//       console.error(err);
//     }
//   }

//   // Fetch schools and teachers
//   async function fetchSchoolsAndTeachers() {
//     try {
//       const schoolRes = await fetch("/api/schools");
//       const teacherRes = await fetch("/api/users?role=TEACHER");
//       setSchools(await schoolRes.json());
//       setTeachers(await teacherRes.json());
//     } catch (err) {
//       console.error(err);
//     }
//   }

//   useEffect(() => {
//     fetchClasses();
//     fetchSchoolsAndTeachers();
//   }, []);

//   // Create class
//   const handleCreate = async () => {
//     if (!name || !schoolId)
//       return setToast({
//         message: "Class name and school are required",
//         type: "error",
//       });

//     setLoading(true);
//     try {
//       const res = await fetch("/api/classes", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           name,
//           schoolId,
//           ...(teacherId ? { teacherId } : {}),
//         }),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error || "Failed to create class");

//       setToast({ message: "Class created successfully", type: "success" });
//       setName("");
//       setSchoolId("");
//       setTeacherId("");
//       fetchClasses();
//     } catch (err: any) {
//       setToast({ message: err.message, type: "error" });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Delete class
//   const handleDelete = async (_id: string) => {
//     if (!confirm("Delete this class?")) return;
//     try {
//       await fetch("/api/classes", {
//         method: "DELETE",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ _id }),
//       });
//       fetchClasses();
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   return (
//     <div className="max-w-5xl mx-auto p-6 space-y-4 text-gray-700">
//       <h1 className="text-2xl font-bold">Classes</h1>

//       {/* Create Class Form */}
//       <div className="grid md:grid-cols-3 gap-2 mb-4">
//         <input
//           type="text"
//           placeholder="Class Name"
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//           className="border rounded px-3 py-2 w-full"
//         />

//         {/* School Select */}
//         <select
//           value={schoolId}
//           onChange={(e) => setSchoolId(e.target.value)}
//           className="border rounded px-3 py-2 w-full"
//         >
//           <option value="">Select School</option>
//           {schools.map((s) => (
//             <option key={s._id} value={s._id}>
//               {s.name}
//             </option>
//           ))}
//         </select>

//         {/* Teacher Select */}
//         <select
//           value={teacherId}
//           onChange={(e) => setTeacherId(e.target.value)}
//           className="border rounded px-3 py-2 w-full"
//         >
//           <option value="">Assign Teacher (Optional)</option>
//           {teachers.map((t) => (
//             <option key={t._id} value={t._id}>
//               {t.name}
//             </option>
//           ))}
//         </select>

//         <button
//           onClick={handleCreate}
//           disabled={loading}
//           className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 md:col-span-3"
//         >
//           {loading ? "Creating..." : "Create Class"}
//         </button>
//       </div>

//       {/* Classes List */}
//       <div className="space-y-2">
//         {classes.map((cls) => (
//           <div
//             key={cls._id}
//             className="flex justify-between items-center border p-2 rounded"
//           >
//             <span>
//               {cls.name} -{" "}
//               {cls.schoolId ? `School: ${cls.schoolId.name}` : "No school"}{" "}
//               {cls.teacherId ? `- Teacher: ${cls.teacherId.name}` : ""}
//             </span>
//             <button
//               onClick={() => handleDelete(cls._id)}
//               className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
//             >
//               Delete
//             </button>
//           </div>
//         ))}
//       </div>

//       {toast && (
//         <Toast
//           message={toast.message}
//           type={toast.type}
//           onClose={() => setToast(null)}
//         />
//       )}
//     </div>
//   );
// }
