"use client";

import { useState, FormEvent } from "react";

interface AuthFormProps {
  title: string;
  submitLabel: string;
  onSubmit: (data: {
    name?: string;
    email: string;
    password: string;
    role?: string;
  }) => Promise<void>;
  showName?: boolean;
  showRole?: boolean;
}

export default function AuthForm({
  title,
  submitLabel,
  onSubmit,
  showName,
  showRole,
}: AuthFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"ADMIN" | "TEACHER" | "STUDENT" | "PARENT">(
    "STUDENT"
  );
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await onSubmit({ name, email, password, role });
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    }
  };

  return (
    <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
        {title}
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {showName && (
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
            required
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
          required
        />
        {showRole && (
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as any)}
            className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
          >
            <option value="ADMIN">Admin</option>
            <option value="TEACHER">Teacher</option>
            <option value="STUDENT">Student</option>
            <option value="PARENT">Parent</option>
          </select>
        )}
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-500 text-sm">{success}</p>}
        <button
          type="submit"
          className="bg-indigo-500 text-white p-3 rounded-lg hover:bg-indigo-600 transition"
        >
          {submitLabel}
        </button>
      </form>
    </div>
  );
}
