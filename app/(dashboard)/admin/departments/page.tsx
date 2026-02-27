"use client";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Department {
  _id: string;
  name: string;
  description?: string;
  head?: { _id: string; name: string };
}

interface UserToken {
  _id: string;
  role: string;
  schoolId: string;
  name: string;
  email: string;
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [admin, setAdmin] = useState<UserToken | null>(null);

  // Fetch current admin
  const fetchAdmin = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (!res.ok) throw new Error("Failed to fetch admin info");
      const data = await res.json();
      setAdmin(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load admin info");
    }
  };

  // Fetch departments
  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/departments");
      const data = await res.json();
      setDepartments(data);
    } catch (err) {
      toast.error("Failed to load departments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmin();
    fetchDepartments();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this department?")) return;
    try {
      const res = await fetch(`/api/admin/departments/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      toast.success("Department deleted");
      fetchDepartments();
    } catch {
      toast.error("Failed to delete department");
    }
  };

  if (!admin) {
    return (
      <div className="p-8 min-h-screen text-center">Loading admin info...</div>
    );
  }

  return (
    <div className="p-8 min-h-screen space-y-6">
      <ToastContainer />
      <div className="flex justify-between items-center">
        <h1 className="text-xl text-gray-700 font-semibold">Departments</h1>
        <button
          onClick={() => {
            setEditingDept(null);
            setModalOpen(true);
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          + Create Department
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Head</th>
              <th className="px-6 py-3">Description</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ?
              <tr>
                <td colSpan={3} className="text-center py-6">
                  Loading...
                </td>
              </tr>
            : departments.length === 0 ?
              <tr>
                <td colSpan={3} className="text-center py-6 text-gray-400">
                  No departments found
                </td>
              </tr>
            : departments.map((dept) => (
                <tr key={dept._id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-3 font-medium text-gray-600">
                    {dept.name}
                  </td>
                  <td className="px-6 py-3 text-gray-600">
                    {dept.head ? dept.head.name : "-"}
                  </td>
                  <td className="px-6 py-3 text-gray-600">
                    {dept.description || "-"}
                  </td>
                  <td className="px-6 py-3 space-x-2">
                    <button
                      onClick={() => {
                        setEditingDept(dept);
                        setModalOpen(true);
                      }}
                      className="text-indigo-600 hover:underline text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(dept._id)}
                      className="text-red-600 hover:underline text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <DepartmentModal
          department={editingDept}
          schoolId={admin.schoolId} // ✅ use the fetched admin info
          onClose={() => setModalOpen(false)}
          onSuccess={() => {
            setModalOpen(false);
            fetchDepartments();
          }}
        />
      )}
    </div>
  );
}

// ------------------- DepartmentModal -------------------
function DepartmentModal({ department, schoolId, onClose, onSuccess }: any) {
  const [name, setName] = useState(department?.name || "");
  const [description, setDescription] = useState(department?.description || "");
  const [headId, setHeadId] = useState(department?.head || "");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!schoolId) return;

    const fetchUsers = async () => {
      try {
        const res = await fetch(`/api/admin/users?roles=ADMIN,TEACHER`, {
          credentials: "include", // ✅ include cookies for auth
        });
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUsers();
  }, [schoolId]);

  const handleSubmit = async () => {
    if (!name.trim()) return alert("Department name required");

    setLoading(true);
    try {
      const res = await fetch(
        department ?
          `/api/admin/departments/${department._id}`
        : "/api/admin/departments",
        {
          method: department ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            description,
            head: headId,
            schoolId,
          }),
        },
      );
      if (!res.ok) throw new Error();
      onSuccess();
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-700">
            {department ? "Edit Department" : "Create Department"}
          </h2>
          <button onClick={onClose}>✕</button>
        </div>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Department Name"
          className="border px-4 py-2 w-full rounded-lg text-gray-600 text-sm"
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          className="border px-4 py-2 w-full rounded-lg text-gray-600 text-sm"
        />

        <select
          value={headId}
          onChange={(e) => setHeadId(e.target.value)}
          className="border px-4 py-2 w-full rounded-lg text-gray-600 text-sm"
        >
          <option value="">Select Department Head (optional)</option>
          {(Array.isArray(users) ? users : []).map((u: any) => (
            <option key={u._id} value={u._id}>
              {u.name} ({u.role})
            </option>
          ))}
        </select>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="border hover:border-0 hover:text-white px-4 py-2 text-sm text-gray-600 hover:bg-red-500 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-indigo-600 text-white px-5 py-2 text-sm rounded-lg"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
