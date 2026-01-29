import React from "react";
import { User } from "../page"; // Import the User type
import { FiEdit, FiTrash } from "react-icons/fi";
import Link from "next/link";

interface Props {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  setToast: React.Dispatch<
    React.SetStateAction<{ message: string; type: "success" | "error" } | null>
  >;

  // ✅ Add these new callbacks
  onAssignClass?: (user: User) => void;
  onAssignParent?: (user: User) => void;
}

export default function UserTable({
  users,
  setUsers,
  setToast,
  onAssignClass,
  onAssignParent,
}: Props) {
  const handleDelete = async (
    id: string,
    setUsers: React.Dispatch<React.SetStateAction<User[]>>,
    setToast: React.Dispatch<
      React.SetStateAction<{
        message: string;
        type: "success" | "error";
      } | null>
    >
  ) => {
    if (!confirm(`Are you sure you want to delete this user?`)) return;

    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete user");

      setUsers((prev) => prev.filter((u) => u._id !== id));
      setToast({
        message: "User deleted successfully",
        type: "success",
      });
    } catch (err) {
      setToast({
        message: "Failed to delete user",
        type: "error",
      });
    }
  };

  return (
    <table className="min-w-full bg-white rounded-lg overflow-hidden shadow">
      <thead className="bg-gray-100">
        <tr>
          <th className="px-4 py-2 text-left text-gray-700">Name</th>
          <th className="px-4 py-2 text-left text-gray-700">Email</th>
          <th className="px-4 py-2 text-left text-gray-700">Role</th>
          <th className="px-4 py-2 text-left text-gray-700">Class</th>
          <th className="px-4 py-2 text-left text-gray-700">Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user._id} className="border-b text-sm">
            <td className="px-4 py-2 text-gray-600">{user.name}</td>
            <td className="px-4 py-2 text-gray-600">{user.email}</td>
            <td className="px-4 py-2 text-gray-600">{user.role}</td>
            <td className="px-4 py-2 text-gray-600">
              {typeof user.classId === "string"
                ? user.classId
                : user.classId?.name}
            </td>
            <td className="px-4 py-2 space-x-2">
              {/* Assign Class Button */}
              {onAssignClass && user.role === "STUDENT" && (
                <button
                  onClick={() => onAssignClass(user)}
                  className="px-2 py-1 bg-blue-500 text-gray-800 text-xs rounded hover:bg-blue-600"
                >
                  Assign Class
                </button>
              )}

              {/* Assign Parent Button */}
              {/* {onAssignParent && user.role === "STUDENT" && (
                <button
                  onClick={() => onAssignParent(user)}
                  className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                >
                  Assign Parent
                </button>
              )} */}
              <button
                onClick={() => handleDelete(user._id, setUsers, setToast)}
              >
                <FiTrash className="inline cursor-pointer text-red-500 hover:text-red-700" />
              </button>
              {/* edit user */}
              <Link
                href={`/admin/users/${user._id}`}
                className="px-2 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600"
              >
                <FiEdit className="inline cursor-pointer" size={15} />
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
