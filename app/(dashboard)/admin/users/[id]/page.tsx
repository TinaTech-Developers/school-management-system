"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Toast from "../_components/Toast";
import { User } from "../page";

function getId(value?: string | { _id: string }) {
  return typeof value === "string" ? value : value?._id || "";
}

function getFirstId(value?: (string | { _id: string })[]) {
  if (!value?.length) return "";
  const v = value[0];
  return typeof v === "string" ? v : v._id;
}

export default function EditUserPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [user, setUser] = useState<User | null>(null);
  const [classes, setClasses] = useState<{ _id: string; name: string }[]>([]);
  const [parents, setParents] = useState<{ _id: string; name: string }[]>([]);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [userRes, classRes, parentRes] = await Promise.all([
          fetch(`/api/users/${id}`),
          fetch("/api/classes"),
          fetch("/api/users?role=PARENT"),
        ]);

        setUser(await userRes.json());
        setClasses(await classRes.json());
        setParents(await parentRes.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setUser((prev) => (prev ? { ...prev, [name]: value } : prev));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");

      setToast({ message: "User updated successfully", type: "success" });
      setTimeout(() => router.push("/admin/users"), 1000);
    } catch (err: any) {
      setToast({ message: err.message, type: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="p-6">Loading user...</p>;
  if (!user) return <p className="p-6">User not found</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Edit User</h1>
        <p className="text-gray-500 text-sm">
          Update user details and assignments
        </p>
      </div>

      <div className="bg-white rounded-xl shadow p-6 space-y-5">
        <Input
          label="Full Name"
          name="name"
          value={user.name}
          onChange={handleChange}
        />
        <Input
          label="Email Address"
          name="email"
          value={user.email}
          onChange={handleChange}
        />

        <Select
          label="Role"
          name="role"
          value={user.role}
          onChange={handleChange}
          options={["ADMIN", "TEACHER", "STUDENT", "PARENT"]}
        />

        {user.role === "STUDENT" && (
          <>
            <Select
              label="Class"
              name="classId"
              value={getId(user.classId)}
              onChange={handleChange}
              options={classes.map((c) => ({ value: c._id, label: c.name }))}
            />

            <Select
              label="Parent"
              name="childrenIds"
              value={getFirstId(user.childrenIds)}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setUser((p) =>
                  p ? { ...p, childrenIds: [e.target.value] } : p
                )
              }
              options={parents.map((p) => ({
                value: p._id,
                label: p.name,
              }))}
            />
          </>
        )}

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}

/* ---------- Reusable Inputs ---------- */

function Input({
  label,
  ...props
}: {
  label: string;
  name: string;
  value: string;
  onChange: any;
}) {
  return (
    <div>
      <label className="text-sm font-medium mb-1 block">{label}</label>
      <input
        {...props}
        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
      />
    </div>
  );
}

function Select({
  label,
  options,
  ...props
}: {
  label: string;
  name: string;
  value: string;
  onChange: any;
  options: { value: string; label: string }[] | string[];
}) {
  return (
    <div>
      <label className="text-sm font-medium mb-1 block">{label}</label>
      <select
        {...props}
        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
      >
        <option value="">Select</option>
        {options.map((o) =>
          typeof o === "string" ? (
            <option key={o} value={o}>
              {o}
            </option>
          ) : (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          )
        )}
      </select>
    </div>
  );
}
