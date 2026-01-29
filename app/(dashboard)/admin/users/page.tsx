"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import UserTable from "./_components/UserTable";
import Filters from "./_components/Filters";
import Toast from "./_components/Toast";
import AssignClass from "./_components/AssignClass";
import AssignParent from "./_components/AssignParent";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "ADMIN" | "TEACHER" | "STUDENT" | "PARENT";
  classId?: { _id: string; name: string } | string;
  subjects?: { _id: string; name: string }[] | string[];
  childrenIds?: { _id: string; name: string }[] | string[];
  schoolId?: { _id: string; name: string } | string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Modals state
  const [assignClassUser, setAssignClassUser] = useState<User | null>(null);
  const [assignParentUser, setAssignParentUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
      setToast({ message: "Failed to fetch users", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAssigned = () => {
    setToast({ message: "Assignment successful", type: "success" });
    fetchUsers(); // refresh table
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-700">Users</h1>
        <Link
          href="/admin/users/create"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          + Add User
        </Link>
      </div>

      {/* Filters */}
      <Filters users={users} setUsers={setUsers} />

      {/* Users Table */}
      {loading ? (
        <p>Loading users...</p>
      ) : (
        <UserTable
          users={users}
          setUsers={setUsers}
          setToast={setToast}
          onAssignClass={(user) => setAssignClassUser(user)}
          onAssignParent={(user) => setAssignParentUser(user)}
        />
      )}

      {/* Assign Class Modal */}
      {assignClassUser && (
        <AssignClass
          student={assignClassUser}
          onClose={() => setAssignClassUser(null)}
          onAssigned={handleAssigned}
        />
      )}

      {/* Assign Parent Modal */}
      {assignParentUser && (
        <AssignParent
          parent={assignParentUser}
          onClose={() => setAssignParentUser(null)}
          onAssigned={handleAssigned}
        />
      )}

      {/* Toast Notification */}
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
