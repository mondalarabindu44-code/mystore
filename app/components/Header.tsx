"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Header() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function logout() {
    await supabase.auth.signOut();
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      {email ? (
        <>
          <span className="text-gray-600">{email}</span>
          <button onClick={logout} className="underline">Logout</button>
        </>
      ) : (
        <Link href="/login" className="underline">Login / Sign up</Link>
      )}
    </div>
  );
}