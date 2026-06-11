"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrders } from "@/hooks/use-orders";
import { formatCurrency } from "@/lib/utils";
import type { OrderStatus } from "@/types";

const statusVariant: Record<
  OrderStatus,
  "default" | "secondary" | "success" | "warning" | "destructive"
> = {
  PENDING: "warning",
  PAID: "success",
  PROCESSING: "secondary",
  SHIPPED: "secondary",
  DELIVERED: "success",
  CANCELLED: "destructive",
};

export default function DashboardOrdersPage() {
  const { data, isLoading } = useOrders();
  const orders = data?.results ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
        <p className="text-muted-foreground">Track and fulfil customer orders.</p>
      </div>

      <Card className="overflow-hidden">
        <div className="grid grid-cols-[1fr_120px_120px_120px] gap-4 border-b bg-muted/40 px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <span>Order</span>
          <span>Date</span>
          <span>Status</span>
          <span>Total</span>
        </div>
        {isLoading ? (
          <div className="space-y-2 p-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <p className="p-12 text-center text-sm text-muted-foreground">
            No orders yet.
          </p>
        ) : (
          <div className="divide-y">
            {orders.map((o) => (
              <div
                key={o.id}
                className="grid grid-cols-[1fr_120px_120px_120px] items-center gap-4 px-5 py-3 text-sm"
              >
                <span className="font-medium">{o.order_number}</span>
                <span className="text-muted-foreground">
                  {new Date(o.created_at).toLocaleDateString()}
                </span>
                <Badge variant={statusVariant[o.status]}>{o.status}</Badge>
                <span>{formatCurrency(o.total)}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
