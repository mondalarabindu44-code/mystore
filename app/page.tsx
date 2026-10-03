import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-white text-black p-6">
      <h1 className="text-3xl font-bold mb-6">My Store</h1>

      {error && <p className="text-red-600">Error: {error.message}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products?.map((p) => (
          <div key={p.id} className="border rounded-xl p-4 shadow-sm">
            <div className="h-40 bg-gray-100 rounded-lg mb-3 flex items-center justify-center text-gray-400">
              Photo
            </div>
            <h2 className="text-lg font-semibold">{p.name}</h2>
            <p className="text-gray-600 text-sm">{p.description}</p>
            <p className="text-xl font-bold mt-2">₹{p.price}</p>
            <p className="text-sm text-gray-500">
              {p.stock > 0 ? `${p.stock} ta ache` : "Sold out"}
            </p>
            <button
              disabled={p.stock === 0}
              className="mt-3 w-full bg-black text-white rounded-lg py-2 disabled:bg-gray-400"
            >
              Add to cart
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}