"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useOrders } from "@/hooks/use-orders";
import { useAuth } from "@/store/auth";
import { useHasMounted } from "@/hooks/use-has-mounted";
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

export default function OrdersPage() {
  const mounted = useHasMounted();
  const { user, status } = useAuth();
  const { data, isLoading, isError } = useOrders();

  if (mounted && status === "unauthenticated") {
    return (
      <div className="container flex flex-col items-center gap-4 py-24 text-center">
        <h1 className="text-2xl font-semibold">Sign in to view your orders</h1>
        <Button asChild>
          <Link href="/login">Sign in</Link>
        </Button>
      </div>
    );
  }

  const orders = data?.results ?? [];

  return (
    <div className="container py-10">
      <h1 className="mb-8 text-3xl font-semibold tracking-tight">My orders</h1>

      {isLoading || !user ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
          Couldn’t load your orders.
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
          You haven’t placed any orders yet.
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div>
                  <p className="font-medium">{order.order_number}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString()} ·{" "}
                    {order.items.length} item(s)
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={statusVariant[order.status]}>
                    {order.status}
                  </Badge>
                  <span className="font-semibold">
                    {formatCurrency(order.total)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
