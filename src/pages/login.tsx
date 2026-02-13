'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Eye, EyeOff, Lock, Mail, Sparkles } from "lucide-react";
import { Geist } from "next/font/google";
import { baseUrl } from "../../config";
import axios from "axios";
import toast from "react-hot-toast";

const geistSans = Geist({
  subsets: ["latin"],
});

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const savedEmail = localStorage.getItem("crm:rememberEmail");
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

const handleSubmit = async (event: React.FormEvent) => {
  event.preventDefault();

  if (!emailRegex.test(email)) {
    toast.error("Enter a valid email address.");
    return;
  }

  if (password.trim().length < 6) {
    toast.error("Password must be at least 6 characters.");
    return;
  }

  try {
    setLoading(true);

    const response = await axios.post(baseUrl.userLogin, {
      email,
      password,
    });

    const data = response.data;

    // ✅ Save token
    localStorage.setItem("token", data.token);

    // ✅ Remember email
    if (remember) {
      localStorage.setItem("rememberEmail", email);
    } else {
      localStorage.removeItem("rememberEmail");
    }

    toast.success("Login successful!");

    setTimeout(() => {
      router.push("/");
    }, 800);

  } catch (err: any) {
    toast.error(
      err.response?.data?.message || "Login failed. Try again."
    );
  } finally {
    setLoading(false);
  }
};



  return (
    <div className={`${geistSans.className} flex min-h-screen items-center justify-center bg-white px-4`}>
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-slate-900 shadow-2xl ring-1 ring-slate-800 lg:grid-cols-[1.05fr_1fr]">

        {/* Left Side */}
        <div className="hidden flex-col justify-between gap-10 bg-slate-800 p-10 text-white lg:flex">
          <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-widest text-slate-300">
            <Sparkles className="h-4 w-4" />
            CRM System
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl font-semibold leading-tight">
              Manage your sales pipeline smarter & faster.
            </h1>
            <p className="text-sm text-slate-300">
              Track leads, schedule follow-ups, monitor performance and grow your business with a powerful CRM dashboard.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5 text-sm text-slate-300">
            “Our team productivity improved within 2 weeks after using this CRM.”
            <div className="mt-3 text-xs font-semibold text-white">— Sales Team</div>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex flex-col justify-center bg-slate-900 px-6 py-10 sm:px-10 text-white">

          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Welcome Back
            </p>
            <h2 className="mt-2 text-2xl font-semibold">
              Sign in to your account
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Enter your email and password to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                Email
              </span>
              <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 focus-within:border-indigo-500">
                <Mail className="h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </label>

            {/* Password */}
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                Password
              </span>
              <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 focus-within:border-indigo-500">
                <Lock className="h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="text-slate-400 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>

            {/* Remember */}
            <div className="flex items-center justify-between text-sm text-slate-400">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-indigo-500"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                Remember me
              </label>
              <button type="button" className="text-indigo-400 hover:text-indigo-300">
                Forgot password?
              </button>
            </div>

            {/* Errors */}
            {error && (
              <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-xl border border-green-500/40 bg-green-500/10 px-4 py-3 text-sm text-green-300">
                {success}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-indigo-500 disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-xs text-slate-500">
            © 2026 CRM System. All rights reserved.
          </p>
        </div>

      </div>
    </div>
  );
}
