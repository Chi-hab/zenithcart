"use client";

import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useProducts } from "@/hooks/use-products";
import { formatCurrency } from "@/lib/utils";

export default function DashboardProductsPage() {
  const { data, isLoading } = useProducts();
  const products = data?.results ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
          <p className="text-muted-foreground">Manage your catalog.</p>
        </div>
        <Button
          onClick={() => toast.info("Product creation form wires up in Phase 4.")}
        >
          <Plus className="h-4 w-4" /> New product
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="grid grid-cols-[1fr_120px_120px_100px] gap-4 border-b bg-muted/40 px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <span>Product</span>
          <span>Price</span>
          <span>Stock</span>
          <span>Status</span>
        </div>
        {isLoading ? (
          <div className="space-y-2 p-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className="p-12 text-center text-sm text-muted-foreground">
            No products yet.
          </p>
        ) : (
          <div className="divide-y">
            {products.map((p) => (
              <div
                key={p.id}
                className="grid grid-cols-[1fr_120px_120px_100px] items-center gap-4 px-5 py-3 text-sm"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-9 w-9 shrink-0 rounded-md border bg-muted bg-cover bg-center"
                    style={
                      p.images?.[0]?.image
                        ? { backgroundImage: `url(${p.images[0].image})` }
                        : undefined
                    }
                  />
                  <span className="line-clamp-1 font-medium">{p.name}</span>
                </div>
                <span>{formatCurrency(p.price, p.currency)}</span>
                <span>{p.available_stock}</span>
                <Badge variant={p.is_active ? "success" : "secondary"}>
                  {p.is_active ? "Active" : "Draft"}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
