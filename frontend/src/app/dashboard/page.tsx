"use client";

import { Boxes, DollarSign, Package, ReceiptText } from "lucide-react";

import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useProducts } from "@/hooks/use-products";
import { useOrders } from "@/hooks/use-orders";
import { useInventory } from "@/hooks/use-inventory";
import { useAuth } from "@/store/auth";
import { formatCurrency } from "@/lib/utils";

export default function DashboardOverview() {
  const user = useAuth((s) => s.user);
  const products = useProducts();
  const orders = useOrders();
  const inventory = useInventory();

  const orderList = orders.data?.results ?? [];
  const revenue = orderList
    .filter((o) => o.status !== "CANCELLED")
    .reduce((sum, o) => sum + Number(o.total), 0);
  const lowStock =
    inventory.data?.results.filter((r) => r.needs_reorder).length ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back{user?.full_name ? `, ${user.full_name}` : ""}
        </h1>
        <p className="text-muted-foreground">
          Here’s what’s happening with your store.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Products"
          value={products.data?.count ?? 0}
          icon={Package}
          loading={products.isLoading}
        />
        <StatCard
          label="Orders"
          value={orders.data?.count ?? 0}
          icon={ReceiptText}
          loading={orders.isLoading}
        />
        <StatCard
          label="Revenue"
          value={formatCurrency(revenue)}
          icon={DollarSign}
          loading={orders.isLoading}
        />
        <StatCard
          label="Low stock"
          value={lowStock}
          icon={Boxes}
          loading={inventory.isLoading}
          hint="Items needing reorder"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent orders</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : orderList.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No orders yet.
            </p>
          ) : (
            <div className="divide-y">
              {orderList.slice(0, 6).map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between py-3 text-sm"
                >
                  <span className="font-medium">{order.order_number}</span>
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary">{order.status}</Badge>
                    <span>{formatCurrency(order.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
