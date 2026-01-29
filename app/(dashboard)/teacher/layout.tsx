"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiHome,
  FiClipboard,
  FiBook,
  FiUsers,
  FiLogOut,
  FiClock,
  FiMenu,
} from "react-icons/fi";
import { signOut } from "next-auth/react";

interface TeacherLayoutProps {
  children: ReactNode;
}

export default function TeacherLayout({ children }: TeacherLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();
  const navItems = [
    { name: "Dashboard", icon: <FiHome size={22} />, href: "/teacher" },
    {
      name: "Timetable",
      icon: <FiClock size={22} />,
      href: "/teacher/timetable",
    },
    { name: "Classes", icon: <FiBook size={22} />, href: "/teacher/classes" },
    // {
    //   name: "Students",
    //   icon: <FiUsers size={22} />,
    //   href: "/teacher/students",
    // },
    // {
    //   name: "Attendance",
    //   icon: <FiClipboard size={22} />,
    //   href: "/teacher/attendance",
    // },
    {
      name: "Results",
      icon: <FiClipboard size={22} />,
      href: "/teacher/results",
    },
    {
      name: "Assignments",
      icon: <FiBook size={22} />,
      href: "/teacher/assignments",
    },
    { name: "Profile", icon: <FiUsers size={22} />, href: "/teacher/profile" },
  ];

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <aside
        className={`bg-white shadow-lg transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-20"
        } flex flex-col relative`}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute top-4 right-[-12px] bg-white border border-gray-200 rounded-full shadow p-1 text-gray-500 hover:text-indigo-600 transition z-20"
        >
          <FiMenu size={20} />
        </button>

        {/* Logo */}
        <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
          <span
            className={`text-xl font-bold text-indigo-600 ${
              sidebarOpen ? "block" : "hidden"
            }`}
          >
            Teacher Panel
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto mt-4">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition rounded-lg mx-2 my-1 ${
                pathname === item.href ?
                  "bg-indigo-100 text-indigo-700 font-semibold"
                : ""
              }`}
            >
              {item.icon}
              {sidebarOpen && <span>{item.name}</span>}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-4 py-3 mt-auto mb-4 text-red-600 hover:bg-red-50 transition rounded-lg mx-2"
        >
          <FiLogOut size={20} />
          {sidebarOpen && <span>Logout</span>}
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <header className="flex items-center justify-between h-16 bg-white shadow px-6 sticky top-0 z-10">
          <h1 className="text-xl font-bold text-gray-800">Teacher Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">John Doe</span>
            <img
              src="/avatar.png"
              alt="User Avatar"
              className="w-8 h-8 rounded-full border border-gray-300"
            />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
