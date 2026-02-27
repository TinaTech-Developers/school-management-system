"use client";

import { useEffect, useState } from "react";

/* -------------------- */
/* TYPES */
/* -------------------- */

type AcademicStatus = "UPCOMING" | "ACTIVE" | "COMPLETED";

interface Term {
  name: string;
  startDate: string;
  endDate: string;
}

interface AcademicYear {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: AcademicStatus;
  isCurrent: boolean;
  terms: Term[];
}

/* -------------------- */
/* COMPONENT */
/* -------------------- */

export default function AcademicYearPage() {
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState<AcademicYear | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    fetchYears();
  }, []);

  const fetchYears = async () => {
    try {
      const res = await fetch("/api/admin/academic-years");

      if (!res.ok) throw new Error("Failed to fetch");

      const data: AcademicYear[] = await res.json();
      setYears(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load academic years:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 min-h-screen space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Academic Years
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage school academic calendar structure
          </p>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-sm hover:bg-indigo-700 transition"
        >
          + Create Academic Year
        </button>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <StatCard title="Total Academic Years" value={years.length} />
        <StatCard
          title="Active Year"
          value={years.find((y) => y.status === "ACTIVE")?.name ?? "-"}
        />
        <StatCard
          title="Current Year"
          value={years.find((y) => y.isCurrent)?.name ?? "-"}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs tracking-wide">
            <tr>
              <th className="px-6 py-4 text-left">Name</th>
              <th className="px-6 py-4 text-left">Duration</th>
              <th className="px-6 py-4 text-left">Status</th>
              <th className="px-6 py-4 text-left">Terms</th>
              <th className="px-6 py-4 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ?
              <tr>
                <td colSpan={5} className="text-center py-10 text-gray-500">
                  Loading academic years...
                </td>
              </tr>
            : years.length === 0 ?
              <tr>
                <td colSpan={5} className="text-center py-10 text-gray-400">
                  No academic years created yet.
                </td>
              </tr>
            : years.map((year) => (
                <tr key={year._id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-800">
                    {year.name}
                    {year.isCurrent && (
                      <span className="ml-2 text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full">
                        Current
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    {new Date(year.startDate).toLocaleDateString()} -{" "}
                    {new Date(year.endDate).toLocaleDateString()}
                  </td>

                  <td className="px-6 py-4">
                    <StatusBadge status={year.status} />
                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    {year.terms?.length ?? 0} Terms
                  </td>

                  <td className="px-6 py-4 space-x-2">
                    <button
                      onClick={() => {
                        setSelectedYear(year);
                        setEditOpen(true);
                      }}
                      className="text-indigo-600 text-sm hover:underline"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => {
                        setSelectedYear(year);
                        setViewOpen(true);
                      }}
                      className="text-gray-500 text-sm hover:underline"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
      <CreateAcademicYearModal
        open={open}
        onClose={() => setOpen(false)}
        onSuccess={fetchYears}
      />
      {viewOpen && selectedYear && (
        <ViewAcademicYearModal
          year={selectedYear}
          onClose={() => setViewOpen(false)}
        />
      )}

      {editOpen && selectedYear && (
        <EditAcademicYearModal
          year={selectedYear}
          onClose={() => setEditOpen(false)}
          onSuccess={() => {
            fetchYears();
            setEditOpen(false);
          }}
        />
      )}
    </div>
  );
}

/* -------------------- */
/* SMALL COMPONENTS */
/* -------------------- */

function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border">
      <p className="text-xs text-gray-500 uppercase tracking-wide">{title}</p>
      <h2 className="text-xl font-semibold text-gray-800 mt-2">{value}</h2>
    </div>
  );
}

function StatusBadge({ status }: { status: AcademicStatus }) {
  const colors: Record<AcademicStatus, string> = {
    UPCOMING: "bg-yellow-100 text-yellow-700",
    ACTIVE: "bg-green-100 text-green-700",
    COMPLETED: "bg-gray-200 text-gray-700",
  };

  return (
    <span
      className={`px-3 py-1 text-xs font-medium rounded-full ${colors[status]}`}
    >
      {status}
    </span>
  );
}

interface CreateModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function CreateAcademicYearModal({
  open,
  onClose,
  onSuccess,
}: CreateModalProps) {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [terms, setTerms] = useState<Term[]>([
    { name: "", startDate: "", endDate: "" },
  ]);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const addTerm = () => {
    setTerms([...terms, { name: "", startDate: "", endDate: "" }]);
  };

  const removeTerm = (index: number) => {
    setTerms(terms.filter((_, i) => i !== index));
  };

  const updateTerm = (index: number, field: keyof Term, value: string) => {
    const updated = [...terms];
    updated[index][field] = value;
    setTerms(updated);
  };

  const handleSubmit = async () => {
    if (!name || !startDate || !endDate) {
      alert("Please fill all required fields");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/academic-years", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          startDate,
          endDate,
          terms,
        }),
      });

      if (!res.ok) throw new Error("Failed to create");

      onSuccess();
      onClose();

      // Reset
      setName("");
      setStartDate("");
      setEndDate("");
      setTerms([{ name: "", startDate: "", endDate: "" }]);
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">
            Create Academic Year
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Basic Info */}
        <div className="grid md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Academic Year Name (e.g. 2025/2026)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border rounded-lg px-4 py-2 text-sm text-gray-500"
          />

          <div className="flex gap-3">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border rounded-lg px-4 py-2 text-sm w-full text-gray-500"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border rounded-lg px-4 py-2 text-sm w-full text-gray-500"
            />
          </div>
        </div>

        {/* Terms Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-700">
              Terms Structure
            </h3>
            <button
              onClick={addTerm}
              className="text-indigo-600 text-sm font-medium"
            >
              + Add Term
            </button>
          </div>

          {terms.map((term, index) => (
            <div
              key={index}
              className="border rounded-xl p-4 space-y-3 bg-gray-50"
            >
              <div className="flex justify-between items-center">
                <p className="text-xs font-medium text-gray-500">
                  Term {index + 1}
                </p>
                {terms.length > 1 && (
                  <button
                    onClick={() => removeTerm(index)}
                    className="text-red-500 text-xs"
                  >
                    Remove
                  </button>
                )}
              </div>

              <input
                type="text"
                placeholder="Term Name"
                value={term.name}
                onChange={(e) => updateTerm(index, "name", e.target.value)}
                className="border rounded-lg px-4 py-2 text-sm w-full"
              />

              <div className="flex gap-3">
                <input
                  type="date"
                  value={term.startDate}
                  onChange={(e) =>
                    updateTerm(index, "startDate", e.target.value)
                  }
                  className="border rounded-lg px-4 py-2 text-sm w-full"
                />
                <input
                  type="date"
                  value={term.endDate}
                  onChange={(e) => updateTerm(index, "endDate", e.target.value)}
                  className="border rounded-lg px-4 py-2 text-sm w-full"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Academic Year"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ViewAcademicYearModal({
  year,
  onClose,
}: {
  year: AcademicYear;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl p-8 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg text-gray-700 font-semibold">
            Academic Year Details
          </h2>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          <p>
            <strong>Name:</strong> {year.name}
          </p>
          <p>
            <strong>Duration:</strong>{" "}
            {new Date(year.startDate).toLocaleDateString()} -{" "}
            {new Date(year.endDate).toLocaleDateString()}
          </p>
          <p>
            <strong>Status:</strong> {year.status}
          </p>
          <p>
            <strong>Current:</strong> {year.isCurrent ? "Yes" : "No"}
          </p>
        </div>

        <div>
          <h3 className="font-medium mb-2 text-gray-700">Terms</h3>
          <div className="space-y-2 text-gray-500">
            {year.terms.map((term, index) => (
              <div key={index} className="border p-3 rounded-lg text-sm">
                <p>
                  <strong>{term.name}</strong>
                </p>
                <p>
                  {new Date(term.startDate).toLocaleDateString()} -{" "}
                  {new Date(term.endDate).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function EditAcademicYearModal({
  year,
  onClose,
  onSuccess,
}: {
  year: AcademicYear;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState<AcademicYear>(year);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/academic-years/${year._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error();

      onSuccess();
    } catch {
      alert("Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-2xl text-gray-600 rounded-2xl shadow-xl p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Edit Academic Year</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="border rounded-lg px-4 py-2 w-full text-sm"
        />

        <div className="flex gap-3">
          <input
            type="date"
            value={form.startDate.slice(0, 10)}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            className="border rounded-lg px-4 py-2 w-full text-sm"
          />
          <input
            type="date"
            value={form.endDate.slice(0, 10)}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            className="border rounded-lg px-4 py-2 w-full text-sm"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            onClick={onClose}
            className="border px-4 text-sm py-2 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            disabled={loading}
            className="bg-indigo-600 text-white px-5 text-sm py-2 rounded-lg"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
