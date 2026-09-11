"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const router = useRouter();
  useEffect(() => {
  const checkUser = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.push("/auth/login");
    }
  };

  checkUser();
}, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <div className="min-h-screen bg-[#0B0B0F] text-white p-8">
      <div className="mx-auto max-w-5xl">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">
              👋 Welcome to Kivraa
            </h1>

            <p className="mt-2 text-gray-400">
              Your personal notes dashboard.
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-xl bg-red-600 px-5 py-3 font-semibold hover:bg-red-700"
          >
            Logout
          </button>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">

          <div className="rounded-2xl bg-[#15151E] p-6 border border-gray-800">
            <h2 className="text-xl font-semibold">📚 Notes</h2>
            <p className="mt-2 text-gray-400">
              Total Notes
            </p>
            <p className="mt-4 text-5xl font-bold text-[#F5B700]">
              0
            </p>
          </div>

          <div className="rounded-2xl bg-[#15151E] p-6 border border-gray-800">
            <h2 className="text-xl font-semibold">⬆️ Upload</h2>
            <p className="mt-2 text-gray-400">
              Upload your study notes.
            </p>

            <button className="mt-6 w-full rounded-xl bg-[#F5B700] py-3 font-semibold text-black">
              Upload Notes
            </button>
          </div>

          <div className="rounded-2xl bg-[#15151E] p-6 border border-gray-800">
            <h2 className="text-xl font-semibold">❤️ Favorites</h2>
            <p className="mt-2 text-gray-400">
              Saved notes will appear here.
            </p>

            <p className="mt-4 text-5xl font-bold text-[#F5B700]">
              0
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}