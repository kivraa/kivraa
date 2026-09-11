"use client";

import { useState } from "react";

export default function TestAIPage() {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function testAI() {
    setLoading(true);
    setResult("");

    try {
      const response = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: `
Photosynthesis is the process by which green plants use sunlight,
carbon dioxide, and water to produce glucose and oxygen.
Chlorophyll absorbs sunlight and helps convert light energy into
chemical energy.
          `,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setResult(`Error: ${data.error}`);
        return;
      }

      setResult(data.summary);
    } catch (error) {
      setResult("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <h1 className="text-3xl font-bold">Kivraa AI Test 🤖</h1>

      <button
        onClick={testAI}
        disabled={loading}
        className="mt-6 rounded-lg bg-yellow-400 px-6 py-3 font-semibold text-black"
      >
        {loading ? "AI is thinking..." : "Test Gemini AI"}
      </button>

      {result && (
        <div className="mt-8 whitespace-pre-wrap rounded-xl bg-zinc-900 p-6">
          {result}
        </div>
      )}
    </main>
  );
}