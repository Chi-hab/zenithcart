"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { accountApi, cartApi, orderApi } from "@/lib/api/endpoints";
import type { Address } from "@/types";

export function useOrders() {
  return useQuery({
    queryKey: ["orders"],
    queryFn: () => orderApi.list(),
  });
}

export interface PlaceOrderInput {
  address: Omit<Address, "id" | "is_default">;
  lines: { productId: string; quantity: number }[];
  taxRate?: string;
}

/**
 * End-to-end checkout: sync the local cart to the server, create a shipping
 * address, convert the cart into an order, then confirm payment.
 */
export function usePlaceOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ address, lines, taxRate }: PlaceOrderInput) => {
      // 1. Mirror the persisted client cart onto the server-side cart.
      const cart = await cartApi.get();
      await Promise.all(cart.items.map((item) => cartApi.removeItem(item.id)));
      for (const line of lines) {
        await cartApi.addItem({
          product: line.productId,
          quantity: line.quantity,
        });
      }
      // 2. Persist the shipping address for this user.
      const created = await accountApi.createAddress({
        ...address,
        is_default: true,
      });
      // 3. Convert the cart into an order (writable nested serializer).
      const order = await orderApi.checkout({
        shipping_address: created.id,
        tax_rate: taxRate,
      });
      // 4. Confirm the mock payment, triggering async fulfilment.
      await orderApi.pay(order.id);
      return order;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  });
}

export function usePayOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => orderApi.pay(orderId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  });
}
