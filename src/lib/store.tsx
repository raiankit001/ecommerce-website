import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Product } from "@/data/products";

export type CartItem = { product: Product; qty: number; size?: string; color?: string };

type ShopState = {
  cart: CartItem[];
  wishlist: number[];
  user: { email: string } | null;
  theme: "light" | "dark";
  addToCart: (p: Product, opts?: { size?: string; color?: string; qty?: number }) => void;
  updateQty: (id: number, qty: number) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
  toggleWishlist: (id: number) => void;
  setUser: (u: { email: string } | null) => void;
  toggleTheme: () => void;
  cartCount: number;
  subtotal: number;
};

const ShopCtx = createContext<ShopState | null>(null);

const read = <T,>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;
  try { const v = localStorage.getItem(key); return v ? (JSON.parse(v) as T) : fallback; }
  catch { return fallback; }
};

export function ShopProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setCart(read("cart", []));
    setWishlist(read("wishlist", []));
    setUser(read("user", null));
    const t = read<"light" | "dark">("theme", "light");
    setTheme(t);
    document.documentElement.classList.toggle("dark", t === "dark");
    setHydrated(true);
  }, []);

  useEffect(() => { if (hydrated) localStorage.setItem("cart", JSON.stringify(cart)); }, [cart, hydrated]);
  useEffect(() => { if (hydrated) localStorage.setItem("wishlist", JSON.stringify(wishlist)); }, [wishlist, hydrated]);
  useEffect(() => { if (hydrated) localStorage.setItem("user", JSON.stringify(user)); }, [user, hydrated]);
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme, hydrated]);

  const value = useMemo<ShopState>(() => ({
    cart, wishlist, user, theme,
    addToCart: (p, opts) => setCart((c) => {
      const i = c.findIndex((x) => x.product.id === p.id && x.size === opts?.size && x.color === opts?.color);
      if (i >= 0) { const next = [...c]; next[i] = { ...next[i], qty: next[i].qty + (opts?.qty ?? 1) }; return next; }
      return [...c, { product: p, qty: opts?.qty ?? 1, size: opts?.size, color: opts?.color }];
    }),
    updateQty: (id, qty) => setCart((c) => c.map((x) => x.product.id === id ? { ...x, qty: Math.max(1, qty) } : x)),
    removeFromCart: (id) => setCart((c) => c.filter((x) => x.product.id !== id)),
    clearCart: () => setCart([]),
    toggleWishlist: (id) => setWishlist((w) => w.includes(id) ? w.filter((x) => x !== id) : [...w, id]),
    setUser,
    toggleTheme: () => setTheme((t) => t === "light" ? "dark" : "light"),
    cartCount: cart.reduce((n, x) => n + x.qty, 0),
    subtotal: cart.reduce((n, x) => n + x.product.price * x.qty, 0),
  }), [cart, wishlist, user, theme]);

  return <ShopCtx.Provider value={value}>{children}</ShopCtx.Provider>;
}

export function useShop() {
  const ctx = useContext(ShopCtx);
  if (!ctx) throw new Error("useShop must be used within ShopProvider");
  return ctx;
}

export const formatPrice = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
