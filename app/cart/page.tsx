"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { CartItem, getCart, saveCart, clearCart } from "@/lib/cart";

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setItems(getCart());
    supabase.auth.getUser().then(({ data }) => setLoggedIn(!!data.user));
  }, []);

  function change(id: string, delta: number) {
    const next = items.map((i) =>
      i.id === id
        ? { ...i, quantity: Math.min(Math.max(i.quantity + delta, 1), i.stock) }
        : i
    );
    setItems(next);
    saveCart(next);
  }

  function remove(id: string) {
    const next = items.filter((i) => i.id !== id);
    setItems(next);
    saveCart(next);
  }

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

  async function placeOrder() {
    setMsg("");
    if (!name || !phone || !address || !pincode) {
      setMsg("Shob ghor puron koro");
      return;
    }
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setMsg("10 digit er sothik phone number dao");
      return;
    }
    if (!/^\d{6}$/.test(pincode)) {
      setMsg("6 digit er pincode dao");
      return;
    }
    setLoading(true);
    const { error } = await supabase.rpc("place_order", {
      p_name: name,
      p_phone: phone,
      p_address: address,
      p_pincode: pincode,
      p_payment: "COD",
      p_items: items.map((i) => ({ product_id: i.id, quantity: i.quantity })),
    });
    setLoading(false);
    if (error) {
      setMsg(error.message);
      return;
    }
    clearCart();
    router.push("/orders");
  }

  return (
    <main className="min-h-screen bg-white text-black p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Cart</h1>
        <Link href="/" className="underline text-sm">Dokan e fire jao</Link>
      </div>

      {items.length === 0 ? (
        <p className="text-gray-600">Cart khali.</p>
      ) : (
        <>
          <div className="space-y-3 mb-6">
            {items.map((i) => (
              <div key={i.id} className="border rounded-xl p-3 flex items-center gap-3">
                {i.image_url ? (
                  <img src={i.image_url} alt={i.name} className="w-14 h-14 object-cover rounded-lg" />
                ) : (
                  <div className="w-14 h-14 bg-gray-100 rounded-lg" />
                )}
                <div className="flex-1">
                  <p className="font-medium">{i.name}</p>
                  <p className="text-sm text-gray-600">₹{i.price}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => change(i.id, -1)} className="border rounded px-2">-</button>
                  <span>{i.quantity}</span>
                  <button onClick={() => change(i.id, 1)} className="border rounded px-2">+</button>
                </div>
                <button onClick={() => remove(i.id)} className="text-red-600 text-sm underline">Remove</button>
              </div>
            ))}
            <p className="text-right text-lg font-bold">Total: ₹{total}</p>
          </div>

          {loggedIn ? (
            <div className="border rounded-xl p-4">
              <h2 className="font-semibold mb-3">Delivery er tottho</h2>
              <input className="w-full border rounded-lg p-2 mb-3" placeholder="Apnar naam" value={name} onChange={(e) => setName(e.target.value)} />
              <input className="w-full border rounded-lg p-2 mb-3" placeholder="Phone number (10 digit)" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <textarea className="w-full border rounded-lg p-2 mb-3" placeholder="Pura thikana (bari, gram/para, thana, jela)" value={address} onChange={(e) => setAddress(e.target.value)} />
              <input className="w-full border rounded-lg p-2 mb-3" placeholder="Pincode (6 digit)" value={pincode} onChange={(e) => setPincode(e.target.value)} />
              <p className="text-sm text-gray-600 mb-3">Payment: Cash on Delivery (product haate pele taka dibe)</p>
              {msg && <p className="text-red-600 text-sm mb-3">{msg}</p>}
              <button onClick={placeOrder} disabled={loading} className="w-full bg-black text-white rounded-lg py-2 disabled:bg-gray-400">
                {loading ? "Opekkha koro..." : "Order koro"}
              </button>
            </div>
          ) : (
            <div className="border rounded-xl p-4">
              <p className="mb-3">Order korte hole prothome login koro.</p>
              <Link href="/login" className="underline">Login / Sign up</Link>
            </div>
          )}
        </>
      )}
    </main>
  );
}