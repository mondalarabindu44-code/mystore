"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getCart } from "@/lib/cart";

export default function Header() {
  const [email, setEmail] = useState<string | null>(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user?.email ?? null);
    });
    const update = () => setCount(getCart().reduce((n, i) => n + i.quantity, 0));
    update();
    window.addEventListener("cart-updated", update);
    return () => {
      sub.subscription.unsubscribe();
      window.removeEventListener("cart-updated", update);
    };
  }, []);

  async function logout() {
    await supabase.auth.signOut();
  }

  return (
    <div className="flex items-center gap-4 text-sm">
      <Link href="/cart" className="underline">Cart ({count})</Link>
      {email ? (
        <>
          <Link href="/orders" className="underline">My Orders</Link>
          <span className="text-gray-600 hidden sm:inline">{email}</span>
          <button onClick={logout} className="underline">Logout</button>
        </>
      ) : (
        <Link href="/login" className="underline">Login / Sign up</Link>
      )}
    </div>
  );
}