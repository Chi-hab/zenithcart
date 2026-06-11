"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useInventory } from "@/hooks/use-inventory";

export default function DashboardInventoryPage() {
  const { data, isLoading } = useInventory();
  const records = data?.results ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Inventory</h1>
        <p className="text-muted-foreground">
          Live stock levels across warehouses.
        </p>
      </div>

      <Card className="overflow-hidden">
        <div className="grid grid-cols-[1fr_100px_100px_100px_120px] gap-4 border-b bg-muted/40 px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <span>Product</span>
          <span>On hand</span>
          <span>Reserved</span>
          <span>Available</span>
          <span>Status</span>
        </div>
        {isLoading ? (
          <div className="space-y-2 p-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : records.length === 0 ? (
          <p className="p-12 text-center text-sm text-muted-foreground">
            No inventory records yet.
          </p>
        ) : (
          <div className="divide-y">
            {records.map((r) => (
              <div
                key={r.id}
                className="grid grid-cols-[1fr_100px_100px_100px_120px] items-center gap-4 px-5 py-3 text-sm"
              >
                <span className="line-clamp-1 font-medium">
                  {r.product_name}
                </span>
                <span>{r.quantity}</span>
                <span>{r.reserved}</span>
                <span>{r.available}</span>
                <Badge variant={r.needs_reorder ? "destructive" : "success"}>
                  {r.needs_reorder ? "Reorder" : "Healthy"}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
