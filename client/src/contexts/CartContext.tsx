/**
 * Direção visual: Ateliê de Concreto — o estado do carrinho deve ser discreto, direto e
 * confiável, deixando o foco visual nas peças e na fluidez de compra.
 */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Product } from "@/data/products";

/** Representa uma combinação única de peça, tamanho escolhido e quantidade na sacola. */
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

// Contexto compartilhado para a seleção enquanto a pessoa navega pela vitrine.
const CartContext = createContext<CartContextValue | null>(null);
// Chave de armazenamento local; a sacola persiste no dispositivo até ser enviada ou limpa.
const CART_KEY = "use-brito-cart";

/** Disponibiliza a sacola para a loja e sincroniza suas escolhas com localStorage. */
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Recupera uma seleção deixada em uma visita anterior, descartando dados corrompidos.
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

  // Mantém o armazenamento local alinhado após cada inclusão, remoção ou ajuste de quantidade.
  useEffect(() => {
    window.localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo<CartContextValue>(() => ({
    items,
    count: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    // Itens iguais são agrupados pelo par produto + tamanho, sem duplicar a linha da seleção.
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
    // Quantidade zero é interpretada como remoção da peça da sacola.
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

/** Hook de acesso seguro à sacola; só pode ser usado dentro de CartProvider. */
export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart deve ser usado dentro de CartProvider");
  return context;
}
