"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useCart } from "@/store/cart";
import type { Product } from "@/types";

export function AddToCartButton({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const addItem = useCart((s) => s.addItem);
  const inStock = product.available_stock > 0;

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center rounded-md border">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          disabled={!inStock}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="w-10 text-center text-sm">{qty}</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setQty((q) => q + 1)}
          disabled={!inStock}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <Button
        size="lg"
        className="flex-1"
        disabled={!inStock}
        onClick={() => {
          addItem(product, qty);
          toast.success(`Added ${qty} × ${product.name} to cart`);
        }}
      >
        <ShoppingBag className="h-4 w-4" />
        {inStock ? "Add to cart" : "Sold out"}
      </Button>
    </div>
  );
}
