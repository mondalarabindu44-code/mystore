"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Order = {
  id: string;
  customer_name: string;
  phone: string;
  address: string;
  pincode: string;
  payment_method: string;
  total: number;
  status: string;
  created_at: string;
  order_items: { product_name: string; quantity: number; price: number }[];
};

const STATUSES = ["new", "confirmed", "shipped", "delivered", "cancelled"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(true);
  const [msg, setMsg] = useState("");

  async function load() {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) {
      setLoggedIn(false);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("orders")
      .select(
        "id,customer_name,phone,address,pincode,payment_method,total,status,created_at,order_items(product_name,quantity,price)"
      )
      .order("created_at", { ascending: false });
    setOrders((data as Order[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function setStatus(id: string, status: string) {
    setMsg("");
    const { data, error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", id)
      .select();
    if (error || !data || data.length === 0) {
      setMsg("Status bodlano jayni. Admin email diye login korecho to?");
      return;
    }
    setOrders(orders.map((o) => (o.id === id ? { ...o, status } : o)));
  }

  return (
    <main className="min-h-screen bg-white text-black p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sob Order</h1>
        <div className="flex gap-4 text-sm">
          <Link href="/admin" className="underline">Admin</Link>
          <Link href="/" className="underline">Dokan</Link>
        </div>
      </div>

      {msg && <p className="text-red-600 text-sm mb-3">{msg}</p>}
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
              <span>{o.payment_method}</span>
            </div>

            <p className="font-semibold">{o.customer_name}</p>
            <a href={`tel:${o.phone}`} className="text-sm underline">{o.phone}</a>
            <p className="text-sm mt-1">{o.address}</p>
            <p className="text-sm text-gray-600 mb-3">Pincode: {o.pincode}</p>

            <div className="border-t pt-2 mb-3">
              {o.order_items.map((it, idx) => (
                <p key={idx} className="text-sm">
                  {it.product_name} × {it.quantity} = ₹{it.price * it.quantity}
                </p>
              ))}
              <p className="font-bold mt-1">Total: ₹{o.total}</p>
            </div>

            <select
              value={o.status}
              onChange={(e) => setStatus(o.id, e.target.value)}
              className="w-full border rounded-lg p-2"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </main>
  );
}