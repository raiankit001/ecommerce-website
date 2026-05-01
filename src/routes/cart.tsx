import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, X, ArrowRight, ShoppingBag } from "lucide-react";
import { useShop, formatPrice } from "@/lib/store";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Your Bag — Maison Or" }, { name: "description", content: "Review your selected objects." }] }),
  component: Cart,
});

function Cart() {
  const { cart, updateQty, removeFromCart, subtotal } = useShop();
  const tax = subtotal * 0.08;
  const shipping = subtotal > 200 || subtotal === 0 ? 0 : 25;
  const total = subtotal + tax + shipping;

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-6 py-32 text-center">
        <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />
        <h1 className="mt-6 font-display text-4xl font-light">Your bag is empty</h1>
        <p className="mt-4 text-muted-foreground">Begin with something quietly beautiful.</p>
        <Link to="/shop" className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-medium text-primary-foreground shadow-elegant">Shop the collection <ArrowRight className="h-4 w-4" /></Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24">
      <h1 className="font-display text-5xl font-light sm:text-6xl">Your bag</h1>
      <p className="mt-3 text-muted-foreground">{cart.length} {cart.length === 1 ? "object" : "objects"}</p>

      <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_400px]">
        <ul className="divide-y divide-border">
          <AnimatePresence initial={false}>
            {cart.map((item) => (
              <motion.li
                key={item.product.id + (item.size ?? "") + (item.color ?? "")}
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, x: -40, height: 0 }}
                transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
                className="flex gap-6 py-6"
              >
                <Link to="/product/$id" params={{ id: String(item.product.id) }} className="block w-28 shrink-0 sm:w-36">
                  <div className="aspect-square overflow-hidden rounded-xl bg-muted"><img src={item.product.image} alt={item.product.title} className="h-full w-full object-cover" /></div>
                </Link>
                <div className="flex flex-1 flex-col justify-between">
                  <div className="flex justify-between gap-4">
                    <div>
                      <Link to="/product/$id" params={{ id: String(item.product.id) }} className="story-link font-display text-xl">{item.product.title}</Link>
                      <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{item.product.category}</p>
                      {(item.size || item.color) && <p className="mt-2 text-sm text-muted-foreground">{[item.color, item.size].filter(Boolean).join(" · ")}</p>}
                    </div>
                    <button onClick={() => removeFromCart(item.product.id)} aria-label="Remove" className="rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-foreground"><X className="h-4 w-4" /></button>
                  </div>
                  <div className="mt-4 flex items-end justify-between">
                    <div className="inline-flex items-center rounded-full border border-border">
                      <button onClick={() => updateQty(item.product.id, item.qty - 1)} className="p-2.5 hover:bg-accent rounded-l-full"><Minus className="h-3.5 w-3.5" /></button>
                      <motion.span key={item.qty} initial={{ scale: 1.3 }} animate={{ scale: 1 }} className="w-8 text-center text-sm tabular-nums">{item.qty}</motion.span>
                      <button onClick={() => updateQty(item.product.id, item.qty + 1)} className="p-2.5 hover:bg-accent rounded-r-full"><Plus className="h-3.5 w-3.5" /></button>
                    </div>
                    <div className="font-display text-lg tabular-nums">{formatPrice(item.product.price * item.qty)}</div>
                  </div>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>

        <aside className="h-fit rounded-2xl border border-border bg-card p-8 shadow-soft lg:sticky lg:top-28">
          <h3 className="font-display text-2xl">Order summary</h3>
          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd className="tabular-nums">{formatPrice(subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Shipping</dt><dd className="tabular-nums">{shipping === 0 ? "Free" : formatPrice(shipping)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Tax (est.)</dt><dd className="tabular-nums">{formatPrice(tax)}</dd></div>
            <div className="my-3 h-px bg-border" />
            <div className="flex justify-between text-base"><dt className="font-medium">Total</dt><dd className="font-display text-xl tabular-nums">{formatPrice(total)}</dd></div>
          </dl>
          <Link to="/checkout" className="mt-8 flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-4 text-sm font-medium text-primary-foreground shadow-elegant transition hover:scale-[1.02]">Proceed to checkout <ArrowRight className="h-4 w-4" /></Link>
          <Link to="/shop" className="mt-4 block text-center text-sm text-muted-foreground hover:text-foreground">Continue shopping</Link>
        </aside>
      </div>
    </div>
  );
}
