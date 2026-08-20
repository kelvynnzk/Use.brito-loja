/**
 * Direção visual: Ateliê de Concreto — o estado do carrinho deve ser discreto, direto e
 * confiável, deixando o foco visual nas peças e na fluidez de compra.
 */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Product } from "@/data/products";

export type CartItem = { product: Product; size: string; quantity: number };

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  addItem: (product: Product, size: string) => void;
  updateQuantity: (productId: number, size: string, quantity: number) => void;
  removeItem: (productId: number, size: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const CART_KEY = "use-brito-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const saved = window.localStorage.getItem(CART_KEY);
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch {
        window.localStorage.removeItem(CART_KEY);
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo<CartContextValue>(() => ({
    items,
    count: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    addItem: (product, size) => {
      setItems((current) => {
        const existing = current.find((item) => item.product.id === product.id && item.size === size);
        if (existing) {
          return current.map((item) =>
            item.product.id === product.id && item.size === size
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          );
        }
        return [...current, { product, size, quantity: 1 }];
      });
    },
    updateQuantity: (productId, size, quantity) => {
      if (quantity <= 0) {
        setItems((current) => current.filter((item) => !(item.product.id === productId && item.size === size)));
        return;
      }
      setItems((current) =>
        current.map((item) =>
          item.product.id === productId && item.size === size ? { ...item, quantity } : item,
        ),
      );
    },
    removeItem: (productId, size) => {
      setItems((current) => current.filter((item) => !(item.product.id === productId && item.size === size)));
    },
    clearCart: () => setItems([]),
  }), [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart deve ser usado dentro de CartProvider");
  return context;
}
