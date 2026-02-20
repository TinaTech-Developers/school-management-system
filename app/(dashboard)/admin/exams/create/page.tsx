"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreateExamPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    term: "",
    startDate: "",
    endDate: "",
  });

  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);

    const res = await fetch("/api/admin/exams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);

    if (res.ok) {
      router.push("/admin/exams");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="w-full mx-auto p-6">
        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">
            Create Examination
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Define a new examination session and schedule dates
          </p>
        </div>

        {/* FORM CARD */}
        <div className="bg-white border rounded-xl p-6 space-y-6">
          {/* EXAM NAME */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Examination Name
            </label>
            <input
              className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-300"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          {/* TERM */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Academic Term
            </label>
            <input
              placeholder="e.g Term 1"
              className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-300"
              value={form.term}
              onChange={(e) => setForm({ ...form, term: e.target.value })}
            />
          </div>

          {/* DATES */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-300"
                value={form.startDate}
                onChange={(e) =>
                  setForm({ ...form, startDate: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-300"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Link
              href="/admin/exams"
              className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>

            <button
              disabled={loading}
              onClick={submit}
              className="px-5 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-black disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Examination"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
