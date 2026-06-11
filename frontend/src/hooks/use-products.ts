"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { categoryApi, productApi, type ProductInput } from "@/lib/api/endpoints";

export function useProducts(params?: Record<string, string>) {
  return useQuery({
    queryKey: ["products", params ?? {}],
    queryFn: () => productApi.list(params),
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryApi.list(),
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProductInput) => productApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
}
