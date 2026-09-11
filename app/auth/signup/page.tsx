"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password) {
      alert("Please fill all fields.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });

    setLoading(false);

    if (error) {
      alert(error.message);
    } else {
      alert("Signup Successful! Please check your email.");
    }
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

        {/* Heading */}
        <h1 className="mt-6 text-center text-4xl font-bold text-white">
          Create Account
        </h1>

        <p className="mt-2 text-center text-gray-400">
          Notes for Students, by Students.
        </p>

        {/* Form */}
        <div className="mt-8 space-y-5">

          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-gray-700 bg-[#0B0B0F] px-4 py-3 text-white outline-none focus:border-[#F5B700]"
          />

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
            onClick={handleSignup}
            disabled={loading}
            className="w-full rounded-xl bg-[#F5B700] py-3 font-semibold text-black transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </div>

        {/* Divider */}
        <div className="my-6 flex items-center">
          <div className="h-px flex-1 bg-gray-700"></div>
          <span className="mx-3 text-sm text-gray-500">OR</span>
          <div className="h-px flex-1 bg-gray-700"></div>
        </div>

        {/* Google Button */}
        <button className="w-full rounded-xl border border-gray-700 py-3 text-white transition hover:border-[#F5B700]">
          Continue with Google
        </button>

        <p className="mt-8 text-center text-sm text-gray-400">
          Already have an account?{" "}
          <span className="cursor-pointer font-semibold text-[#F5B700]">
            Sign In
          </span>
        </p>

      </div>
    </div>
  );
} 