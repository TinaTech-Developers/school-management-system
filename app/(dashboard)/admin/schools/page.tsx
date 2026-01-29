"use client";

import { useState, useEffect } from "react";
import Toast from "../users/_components/Toast";

interface SchoolType {
  _id: string;
  name: string;
  address?: string;
  phone?: string;
}

export default function SchoolsPage() {
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  async function fetchSchools() {
    const res = await fetch("/api/schools");
    setSchools(await res.json());
  }

  useEffect(() => {
    fetchSchools();
  }, []);

  const handleCreate = async () => {
    if (!name)
      return setToast({ message: "School name is required", type: "error" });

    setLoading(true);
    try {
      const res = await fetch("/api/schools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, address, phone, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create school");

      setToast({ message: "School created successfully", type: "success" });
      setName("");
      setAddress("");
      setPhone("");
      fetchSchools();
    } catch (err: any) {
      setToast({ message: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (_id: string) => {
    if (!confirm("Delete this school?")) return;
    await fetch("/api/schools", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _id }),
    });
    fetchSchools();
  };

  return (
    <div className="max-w-5xl mx-auto p-6 text-gray-700 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-gray-700">Schools</h1>
        <p className="text-gray-500">Manage all schools in your system</p>
      </div>

      {/* Create School Form */}
      <div className="bg-white p-6 rounded-xl shadow-md border space-y-4">
        <h2 className="text-xl font-semibold text-gray-700">Add New School</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="School Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-gray-700"
          />
          <input
            type="text"
            placeholder="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-gray-700"
          />
          <input
            type="text"
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-gray-700"
          />
          <input
            type="text"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-gray-700"
          />
          <button
            onClick={handleCreate}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </div>
      </div>

      {/* School List */}
      <div className="space-y-3">
        {schools.map((s) => (
          <div
            key={s._id}
            className="flex justify-between items-center bg-white border rounded-lg p-4 shadow-sm"
          >
            <div className="space-y-1">
              <p className="font-semibold text-gray-700">{s.name}</p>
              {(s.address || s.phone) && (
                <p className="text-sm text-gray-500">
                  {s.address && `${s.address}`} {s.address && s.phone && " - "}{" "}
                  {s.phone && `${s.phone}`}
                </p>
              )}
            </div>
            <button
              onClick={() => handleDelete(s._id)}
              className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
