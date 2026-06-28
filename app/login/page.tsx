"use client";

import { supabase } from "@/lib/supabase";
import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");

  async function signIn() {
    await supabase.auth.signInWithOtp({
      email,
    });

    alert("Check your email for login link");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
      <div className="p-6 bg-slate-900 rounded-xl w-[400px]">
        <h1 className="text-xl font-bold mb-4">Get Me There Login</h1>

        <input
          className="w-full p-3 bg-slate-800 rounded mb-3"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          onClick={signIn}
          className="w-full bg-blue-600 p-3 rounded"
        >
          Send Magic Link
        </button>
      </div>
    </main>
  );
}