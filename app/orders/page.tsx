"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Order = {
  id: string;
  total: number;
  status: string;
  created_at: string;
  customer_name: string;
  order_items: { product_name: string; quantity: number; price: number }[];
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) {
        setLoggedIn(false);
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("orders")
        .select("id,total,status,created_at,customer_name,order_items(product_name,quantity,price)")
        .eq("user_id", u.user.id)
        .order("created_at", { ascending: false });
      setOrders((data as Order[]) ?? []);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <main className="min-h-screen bg-white text-black p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Orders</h1>
        <Link href="/" className="underline text-sm">Dokan e fire jao</Link>
      </div>

      {loading && <p>Opekkha koro...</p>}
      {!loading && !loggedIn && (
        <Link href="/login" className="underline">Prothome login koro</Link>
      )}
      {!loading && loggedIn && orders.length === 0 && (
        <p className="text-gray-600">Ekhono kono order nai.</p>
      )}

      <div className="space-y-4">
        {orders.map((o) => (
          <div key={o.id} className="border rounded-xl p-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>{new Date(o.created_at).toLocaleString("en-IN")}</span>
              <span className="font-medium text-black">{o.status === "new" ? "Notun order" : o.status}</span>
            </div>
            {o.order_items.map((it, idx) => (
              <p key={idx} className="text-sm">
                {it.product_name} × {it.quantity} = ₹{it.price * it.quantity}
              </p>
            ))}
            <p className="font-bold mt-2">Total: ₹{o.total}</p>
          </div>
        ))}
      </div>
    </main>
  );
}