"use client";

import { User } from "../page";
import { useState } from "react";

interface Props {
  users: User[];
  setUsers: (users: User[]) => void;
}

export default function Filters({ users, setUsers }: Props) {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");

  const handleFilter = () => {
    let filtered = [...users];

    if (search) {
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (role) {
      filtered = filtered.filter((u) => u.role === role);
    }

    setUsers(filtered);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-4">
      <input
        type="text"
        placeholder="Search by name or email"
        className="border p-2 rounded flex-1 border-gray-300 text-gray-500"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <select
        className="border p-2 rounded w-48 border-gray-300 text-gray-500"
        value={role}
        onChange={(e) => setRole(e.target.value)}
      >
        <option value="">All Roles</option>
        <option value="ADMIN">Admin</option>
        <option value="TEACHER">Teacher</option>
        <option value="STUDENT">Student</option>
        <option value="PARENT">Parent</option>
      </select>
      <button
        onClick={handleFilter}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Filter
      </button>
    </div>
  );
}
