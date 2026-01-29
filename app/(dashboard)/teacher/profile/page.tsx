"use client";

import { useEffect, useState, FormEvent } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Teacher {
  name: string;
  email: string;
  role: string;
  phone?: string;
  createdAt: string;
}

export default function TeacherProfile() {
  const [profile, setProfile] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchProfile = async () => {
    const res = await fetch("/api/teacher/profile");
    setProfile(await res.json());
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  /* ================= UPDATE PROFILE ================= */
  const updateProfile = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
    };

    const res = await fetch("/api/teacher/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (!res.ok) return toast.error("Failed to update profile");

    toast.success("Profile updated successfully");
    fetchProfile();
  };

  /* ================= CHANGE PASSWORD ================= */
  const changePassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const payload = {
      currentPassword: formData.get("currentPassword"),
      newPassword: formData.get("newPassword"),
    };

    const res = await fetch("/api/teacher/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) return toast.error("Password change failed");

    toast.success("Password updated");
    e.currentTarget.reset();
  };

  if (!profile) return <p className="p-6 text-gray-600">Loading profile...</p>;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6 text-gray-700">
      <ToastContainer position="top-right" />

      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold">My Profile</h2>
        <p className="text-sm text-gray-500">
          Manage your personal information and security
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Personal Information</h3>

        <form onSubmit={updateProfile} className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              name="name"
              defaultValue={profile.name}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Email Address
            </label>
            <input
              name="email"
              type="email"
              defaultValue={profile.email}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Phone Number
            </label>
            <input
              name="phone"
              defaultValue={profile.phone}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-col justify-center text-sm text-gray-500">
            <p>
              Role: <span className="font-medium">{profile.role}</span>
            </p>
            <p>Joined: {new Date(profile.createdAt).toLocaleDateString()}</p>
          </div>

          <div className="md:col-span-2 flex justify-end mt-2">
            <button
              disabled={loading}
              className="px-6 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition disabled:opacity-60"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      {/* Security Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Security</h3>

        <form onSubmit={changePassword} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium mb-1">
              Current Password
            </label>
            <input
              name="currentPassword"
              type="password"
              required
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              New Password
            </label>
            <input
              name="newPassword"
              type="password"
              required
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>

          <button className="px-6 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition">
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}
