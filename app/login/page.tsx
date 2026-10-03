"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    setMsg("");
    const { error } =
      mode === "signup"
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setMsg(error.message);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-white text-black flex items-center justify-center p-6">
      <div className="w-full max-w-sm border rounded-xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold mb-4">
          {mode === "login" ? "Login" : "Sign up"}
        </h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded-lg p-2 mb-3"
        />
        <input
          type="password"
          placeholder="Password (kom pokkhe 6 ta)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded-lg p-2 mb-3"
        />

        {msg && <p className="text-red-600 text-sm mb-3">{msg}</p>}

        <button
          onClick={submit}
          disabled={loading}
          className="w-full bg-black text-white rounded-lg py-2 disabled:bg-gray-400"
        >
          {loading ? "Opekkha koro..." : mode === "login" ? "Login" : "Sign up"}
        </button>

        <button
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="w-full text-sm text-gray-600 mt-3 underline"
        >
          {mode === "login" ? "Account nai? Sign up koro" : "Account ache? Login koro"}
        </button>
      </div>
    </main>
  );
}