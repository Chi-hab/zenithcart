"use client";

import { useQuery } from "@tanstack/react-query";

import { productApi } from "@/lib/api/endpoints";

export function useProducts(params?: Record<string, string>) {
  return useQuery({
    queryKey: ["products", params ?? {}],
    queryFn: () => productApi.list(params),
  });
}
