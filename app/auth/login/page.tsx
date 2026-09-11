"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please fill all fields.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Login Successful!");

    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-3xl border border-gray-800 bg-[#111118] p-8 shadow-2xl">

        {/* Logo */}
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1B2340] text-3xl font-bold text-[#F5B700]">
            K
          </div>
        </div>

        <h1 className="mt-6 text-center text-4xl font-bold text-white">
          Welcome Back
        </h1>

        <p className="mt-2 text-center text-gray-400">
          Login to your Kivraa account
        </p>

        <div className="mt-8 space-y-5">
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-gray-700 bg-[#0B0B0F] px-4 py-3 text-white outline-none focus:border-[#F5B700]"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-gray-700 bg-[#0B0B0F] px-4 py-3 text-white outline-none focus:border-[#F5B700]"
          />

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full rounded-xl bg-[#F5B700] py-3 font-semibold text-black transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Logging In..." : "Login"}
          </button>
        </div>

        <div className="my-6 flex items-center">
          <div className="h-px flex-1 bg-gray-700"></div>
          <span className="mx-3 text-sm text-gray-500">OR</span>
          <div className="h-px flex-1 bg-gray-700"></div>
        </div>

        <button className="w-full rounded-xl border border-gray-700 py-3 text-white transition hover:border-[#F5B700]">
          Continue with Google
        </button>

        <p className="mt-8 text-center text-sm text-gray-400">
          Don't have an account?{" "}
          <span className="cursor-pointer font-semibold text-[#F5B700]">
            Sign Up
          </span>
        </p>

      </div>
    </div>
  );
}