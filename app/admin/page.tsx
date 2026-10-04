"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  image_url: string | null;
};

export default function AdminPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("1");
  const [file, setFile] = useState<File | null>(null);
  const [fileKey, setFileKey] = useState(0);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    const { data } = await supabase
      .from("products")
      .select("id,name,price,stock,image_url")
      .order("created_at", { ascending: false });
    setProducts(data ?? []);
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
      setChecked(true);
    });
    load();
  }, []);

  async function addProduct() {
    setMsg("");
    if (!name || !price) {
      setMsg("Naam ar dam dite hobe");
      return;
    }
    setLoading(true);

    let image_url: string | null = null;
    if (file) {
      const ext = file.name.split(".").pop();
      const path = `${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("product-images")
        .upload(path, file);
      if (upErr) {
        setMsg("Photo upload hoy nai: " + upErr.message);
        setLoading(false);
        return;
      }
      image_url = supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl;
    }

    const { error } = await supabase.from("products").insert({
      name,
      description,
      price: Number(price),
      stock: Number(stock),
      image_url,
    });
    setLoading(false);

    if (error) {
      setMsg("Product add hoy nai: " + error.message);
      return;
    }
    setMsg("Product add hoye geche!");
    setName("");
    setDescription("");
    setPrice("");
    setStock("1");
    setFile(null);
    setFileKey((k) => k + 1);
    load();
  }

  async function removeProduct(id: string) {
    if (!confirm("Ei product muchhe felbe?")) return;
    const { data, error } = await supabase.from("products").delete().eq("id", id).select();
    if (error || !data || data.length === 0) {
      setMsg("Delete hoy nai. Admin email diye login korecho to?");
      return;
    }
    load();
  }

  if (!checked) return <main className="p-6 text-black bg-white min-h-screen">Opekkha koro...</main>;

  if (!email) {
    return (
      <main className="min-h-screen bg-white text-black p-6">
        <p className="mb-3">Prothome login koro.</p>
        <Link href="/login" className="underline">Login e jao</Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-black p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin</h1>
        <Link href="/" className="underline text-sm">Dokan dekho</Link>
      </div>

      <div className="border rounded-xl p-4 mb-8">
        <h2 className="font-semibold mb-3">Notun product</h2>
        <input className="w-full border rounded-lg p-2 mb-3" placeholder="Product er naam" value={name} onChange={(e) => setName(e.target.value)} />
        <textarea className="w-full border rounded-lg p-2 mb-3" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <div className="flex gap-3 mb-3">
          <input type="number" className="w-1/2 border rounded-lg p-2" placeholder="Dam (₹)" value={price} onChange={(e) => setPrice(e.target.value)} />
          <input type="number" className="w-1/2 border rounded-lg p-2" placeholder="Koyta ache" value={stock} onChange={(e) => setStock(e.target.value)} />
        </div>
        <input key={fileKey} type="file" accept="image/*" className="w-full mb-3" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        {msg && <p className="text-sm mb-3">{msg}</p>}
        <button onClick={addProduct} disabled={loading} className="w-full bg-black text-white rounded-lg py-2 disabled:bg-gray-400">
          {loading ? "Opekkha koro..." : "Product add koro"}
        </button>
      </div>

      <h2 className="font-semibold mb-3">Sob product</h2>
      <div className="space-y-3">
        {products.map((p) => (
          <div key={p.id} className="border rounded-xl p-3 flex items-center gap-3">
            {p.image_url ? (
              <img src={p.image_url} alt={p.name} className="w-14 h-14 object-cover rounded-lg" />
            ) : (
              <div className="w-14 h-14 bg-gray-100 rounded-lg" />
            )}
            <div className="flex-1">
              <p className="font-medium">{p.name}</p>
              <p className="text-sm text-gray-600">₹{p.price} · {p.stock} ta</p>
            </div>
            <button onClick={() => removeProduct(p.id)} className="text-red-600 text-sm underline">Delete</button>
          </div>
        ))}
      </div>
    </main>
  );
}