"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Toast from "../_components/Toast";

interface UserForm {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: "ADMIN" | "TEACHER" | "STUDENT" | "PARENT";
  schoolId: string;

  /* STUDENT */
  classId?: string;
  parentId?: string;

  /* TEACHER */
  subjects?: string[];
}

export default function CreateUserPage() {
  const router = useRouter();
  const [form, setForm] = useState<UserForm>({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "STUDENT",
    schoolId: "",
  });

  const [classes, setClasses] = useState<{ _id: string; name: string }[]>([]);
  const [parents, setParents] = useState<{ _id: string; name: string }[]>([]);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const clsRes = await fetch("/api/classes");
        setClasses(await clsRes.json());

        const parentRes = await fetch("/api/users?role=PARENT");
        setParents(await parentRes.json());
      } catch (err) {
        console.error(err);
      }
    }
    fetchData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create user");

      setToast({ message: "User created successfully", type: "success" });
      setTimeout(() => router.push("/admin/users"), 1200);
    } catch (err: any) {
      setToast({ message: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6 text-gray-700">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Create User</h1>
        <p className="text-sm text-gray-500">
          Add a new user and assign their role and relationships
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-sm border p-6 space-y-6"
      >
        <section>
          <h2 className="font-semibold text-gray-800 mb-4">
            Basic Information
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <InputField
              label="Full Name"
              name="name"
              value={form.name}
              onChange={handleChange}
            />
            <InputField
              label="Email Address"
              name="email"
              value={form.email}
              onChange={handleChange}
            />
            <InputField
              label="Phone Number"
              name="phone"
              value={form.phone}
              onChange={handleChange}
            />
            <InputField
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
            />

            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="ADMIN">Admin</option>
                <option value="TEACHER">Teacher</option>
                <option value="STUDENT">Student</option>
                <option value="PARENT">Parent</option>
              </select>
            </div>

            <InputField
              label="School ID"
              name="schoolId"
              value={form.schoolId}
              onChange={handleChange}
            />
          </div>
        </section>

        {/* STUDENT */}
        {form.role === "STUDENT" && (
          <section className="border-t pt-6">
            <h2 className="font-semibold mb-4">Student Details</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <SelectField
                label="Class"
                value={form.classId || ""}
                onChange={(v) => setForm((p) => ({ ...p, classId: v }))}
                options={classes}
              />
              <SelectField
                label="Parent"
                value={form.parentId || ""}
                onChange={(v) => setForm((p) => ({ ...p, parentId: v }))}
                options={parents}
              />
            </div>
          </section>
        )}

        {/* TEACHER */}
        {form.role === "TEACHER" && (
          <section className="border-t pt-6">
            <h2 className="font-semibold mb-4">Teacher Details</h2>
            <input
              type="text"
              value={form.subjects?.join(",") || ""}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  subjects: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                }))
              }
              className="w-full rounded-lg border px-3 py-2"
              placeholder="Enter subjects separated by commas"
            />
          </section>
        )}

        <div className="flex justify-end gap-3 border-t pt-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 rounded-lg border hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create User"}
          </button>
        </div>
      </form>

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

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { _id: string; name: string }[];
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
      >
        <option value="">Select</option>
        {options.map((o) => (
          <option key={o._id} value={o._id}>
            {o.name}
          </option>
        ))}
      </select>
    </div>
  );
}

function InputField({
  label,
  name,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required
        className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
      />
    </div>
  );
}
