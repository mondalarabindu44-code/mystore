"use client";

import { useState } from "react";
import { addToCart } from "@/lib/cart";

type P = {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  stock: number;
};

export default function AddToCart({ product }: { product: P }) {
  const [added, setAdded] = useState(false);

  function onClick() {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      stock: product.stock,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  return (
    <button
      onClick={onClick}
      disabled={product.stock === 0}
      className="mt-3 w-full bg-black text-white rounded-lg py-2 disabled:bg-gray-400"
    >
      {product.stock === 0 ? "Sold out" : added ? "Added ✓" : "Add to cart"}
    </button>
  );
}