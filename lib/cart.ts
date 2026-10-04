export type CartItem = {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  stock: number;
  quantity: number;
};

const KEY = "cart";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("cart-updated"));
}

export function addToCart(p: Omit<CartItem, "quantity">) {
  const items = getCart();
  const found = items.find((i) => i.id === p.id);
  if (found) {
    found.quantity = Math.min(found.quantity + 1, p.stock);
    found.stock = p.stock;
    found.price = p.price;
  } else {
    items.push({ ...p, quantity: 1 });
  }
  saveCart(items);
}

export function clearCart() {
  saveCart([]);
}