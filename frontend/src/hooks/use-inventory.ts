"use client";

import { useQuery } from "@tanstack/react-query";

import { inventoryApi } from "@/lib/api/endpoints";

export function useInventory() {
  return useQuery({
    queryKey: ["inventory"],
    queryFn: () => inventoryApi.list(),
  });
}
