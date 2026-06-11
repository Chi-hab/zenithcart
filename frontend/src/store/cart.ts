import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { Product } from "@/types";

export interface CartLine {
  productId: string;
  slug: string;
  name: string;
  price: number;
  currency: string;
  image?: string;
  quantity: number;
}

interface CartState {
  items: CartLine[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  totalItems: () => number;
  subtotal: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, quantity = 1) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === product.id,
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === product.id
                  ? { ...i, quantity: i.quantity + quantity }
                  : i,
              ),
            };
          }
          const primary =
            product.images?.find((img) => img.is_primary) ??
            product.images?.[0];
          return {
            items: [
              ...state.items,
              {
                productId: product.id,
                slug: product.slug,
                name: product.name,
                price: Number(product.price),
                currency: product.currency,
                image: primary?.image,
                quantity,
              },
            ],
          };
        }),
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),
      setQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items
            .map((i) =>
              i.productId === productId
                ? { ...i, quantity: Math.max(1, quantity) }
                : i,
            )
            .filter((i) => i.quantity > 0),
        })),
      clear: () => set({ items: [] }),
      totalItems: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    {
      name: "zc-cart",
      // Persist only the line items; derived getters are recomputed.
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
