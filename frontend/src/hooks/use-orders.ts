"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { orderApi } from "@/lib/api/endpoints";

export function useOrders() {
  return useQuery({
    queryKey: ["orders"],
    queryFn: () => orderApi.list(),
  });
}

export function useCheckout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: orderApi.checkout,
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
