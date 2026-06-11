"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/store/cart";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { formatCurrency } from "@/lib/utils";

export default function CartPage() {
  const mounted = useHasMounted();
  const items = useCart((s) => s.items);
  const setQuantity = useCart((s) => s.setQuantity);
  const removeItem = useCart((s) => s.removeItem);
  const subtotal = useCart((s) => s.subtotal());

  if (mounted && items.length === 0) {
    return (
      <div className="container flex flex-col items-center gap-4 py-24 text-center">
        <ShoppingBag className="h-12 w-12 text-muted-foreground opacity-40" />
        <h1 className="text-2xl font-semibold">Your cart is empty</h1>
        <Button asChild>
          <Link href="/products">Continue shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <h1 className="mb-8 text-3xl font-semibold tracking-tight">Your cart</h1>
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.productId}>
              <CardContent className="flex gap-4 p-4">
                <div
                  className="h-20 w-20 shrink-0 rounded-md border bg-muted bg-cover bg-center"
                  style={
                    item.image
                      ? { backgroundImage: `url(${item.image})` }
                      : undefined
                  }
                />
                <div className="flex flex-1 flex-col">
                  <Link
                    href={`/products/${item.slug}`}
                    className="font-medium hover:underline"
                  >
                    {item.name}
                  </Link>
                  <span className="text-sm text-muted-foreground">
                    {formatCurrency(item.price, item.currency)}
                  </span>
                  <div className="mt-auto flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        setQuantity(item.productId, item.quantity - 1)
                      }
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-sm">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        setQuantity(item.productId, item.quantity + 1)
                      }
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <span className="font-semibold">
                    {formatCurrency(item.price * item.quantity, item.currency)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground"
                    onClick={() => removeItem(item.productId)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="h-fit">
          <CardContent className="space-y-4 p-6">
            <h2 className="font-semibold">Order summary</h2>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span>Calculated at checkout</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <Button asChild className="w-full" size="lg">
              <Link href="/checkout">Proceed to checkout</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
