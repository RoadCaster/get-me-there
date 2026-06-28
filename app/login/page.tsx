"use client";

import { supabase } from "@/lib/supabase";
import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");

  async function login() {
    const { error } = await supabase.auth.signInWithOtp({
      email,
    });

    if (!error) {
      alert("Check your email for login link");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
      <div className="w-[400px] p-6 bg-slate-900 rounded-xl">
        <h1 className="text-xl font-bold mb-4">
          Save Your Trips (Optional)
        </h1>

        <input
          className="w-full p-3 bg-slate-800 rounded mb-3"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          onClick={login}
          className="w-full bg-blue-600 p-3 rounded"
        >
          Send Login Link
        </button>
      </div>
    </main>
  );
}