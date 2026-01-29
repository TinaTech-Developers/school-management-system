"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { toast, ToastContainer } from "react-toastify";
import { motion } from "framer-motion";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      toast.error("Invalid email or password");
      setLoading(false);
      return;
    }

    // ✅ ONLY redirect to root
    router.replace("/");
  };

  return (
    <div className="h-screen flex items-center justify-center bg-[#0B0B0B] px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-[#121212] rounded-3xl p-8 shadow-lg border border-white/10"
      >
        {/* School Logo */}
        <div className="flex justify-center mb-4">
          <img
            src="/school-logo.png"
            alt="School Logo"
            className="h-12 w-auto"
          />
        </div>

        <h1 className="text-2xl font-bold text-white text-center mb-2">
          School Portal Login
        </h1>
        <p className="text-center text-gray-400 mb-6 text-sm">
          Enter your credentials to access your portal
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your.email@school.com"
              className="w-full rounded-xl bg-[#1a1a1a] border border-white/20 px-4 py-2.5 text-white text-sm placeholder-gray-500 outline-none focus:ring-2 focus:ring-white/30 transition"
            />
          </div>

          <div>
            <label
              className="block text-sm text-gray-400 mb-1"
              htmlFor="password"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="********"
                className="w-full rounded-xl bg-[#1a1a1a] border border-white/20 px-4 py-2.5 text-white text-sm placeholder-gray-500 outline-none focus:ring-2 focus:ring-white/30 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-sm"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 rounded-xl font-semibold text-sm transition ${
              loading
                ? "bg-gray-500 text-gray-200 cursor-not-allowed"
                : "bg-white text-black hover:bg-[#A89078]"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </motion.button>
        </form>

        <p className="text-center text-gray-500 mt-4 text-sm">
          Don&apos;t have an account?{" "}
          <a
            href="/register"
            className="text-white underline hover:text-gray-300"
          >
            Register here
          </a>
        </p>

        <p className="text-center text-gray-600 mt-6 text-xs">
          © 2026 Your School Portal. All rights reserved.
        </p>

        <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      </motion.div>
    </div>
  );
}
