"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiHome,
  FiUsers,
  FiBook,
  FiClipboard,
  FiLayers,
  FiMenu,
} from "react-icons/fi";
import { useState } from "react";
import { signOut } from "next-auth/react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { name: "Dashboard", href: "/admin", icon: <FiHome /> },
    { name: "Classes", href: "/admin/classes", icon: <FiBook /> },
    { name: "Assignments", href: "/admin/assignments", icon: <FiClipboard /> },
    { name: "Subjects", href: "/admin/subjects", icon: <FiLayers /> },
    { name: "Exams", href: "/admin/exams", icon: <FiClipboard /> },
    { name: "Results", href: "/admin/results", icon: <FiClipboard /> },
    { name: "Fees", href: "/admin/fees", icon: <FiBook /> },
    { name: "Timetable", href: "/admin/timetable", icon: <FiLayers /> },
    {
      name: "Learning Material",
      href: "/admin/learning-material",
      icon: <FiBook />,
    },
    { name: "Schools", href: "/admin/schools", icon: <FiHome /> },
    { name: "Users", href: "/admin/users", icon: <FiUsers /> },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`bg-black text-white p-4 flex flex-col transition-all duration-300 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          {!collapsed && <h2 className="text-2xl font-bold">Admin Panel</h2>}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-white p-1 hover:bg-white/10 rounded-md"
          >
            <FiMenu size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                pathname === item.href
                  ? "bg-white text-black font-semibold"
                  : "hover:bg-white/10"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {!collapsed && <span>{item.name}</span>}
            </Link>
          ))}
        </nav>

        <div className="mt-auto">
          <button
            onClick={() => signOut()}
            className={`w-full px-3 py-2 bg-red-600 rounded-lg text-sm hover:bg-red-700 transition-colors flex items-center justify-center gap-2`}
          >
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
