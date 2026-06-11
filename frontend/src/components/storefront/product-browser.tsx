"use client";

import { useState } from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/components/storefront/product-card";
import { useProducts } from "@/hooks/use-products";

const sortOptions = [
  { value: "-created_at", label: "Newest" },
  { value: "price", label: "Price: low to high" },
  { value: "-price", label: "Price: high to low" },
  { value: "-sales_count", label: "Best selling" },
];

export function ProductBrowser() {
  const [search, setSearch] = useState("");
  const [ordering, setOrdering] = useState("-created_at");

  const params: Record<string, string> = { ordering };
  if (search) params.search = search;

  const { data, isLoading, isError } = useProducts(params);
  const products = data?.results ?? [];

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="pl-9"
          />
        </div>
        <select
          value={ordering}
          onChange={(e) => setOrdering(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          {sortOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {isError && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
          Couldn’t load products. Is the API running at{" "}
          <code>NEXT_PUBLIC_API_URL</code>?
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-square w-full rounded-xl" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          ))}
        </div>
      ) : products.length === 0 && !isError ? (
        <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
          No products found.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
