"use client";

import Link from "next/link";
import { ImageIcon, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/store/cart";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/types";

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCart((s) => s.addItem);
  const primary =
    product.images?.find((img) => img.is_primary) ?? product.images?.[0];

  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-muted">
          {primary ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={primary.image}
              alt={primary.alt_text || product.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <ImageIcon className="h-10 w-10 opacity-40" />
            </div>
          )}
          {product.available_stock <= 0 && (
            <Badge variant="destructive" className="absolute left-3 top-3">
              Sold out
            </Badge>
          )}
        </div>
      </Link>
      <div className="space-y-3 p-4">
        <div className="space-y-1">
          {product.category_detail && (
            <span className="text-xs uppercase tracking-wide text-muted-foreground">
              {product.category_detail.name}
            </span>
          )}
          <Link href={`/products/${product.slug}`}>
            <h3 className="line-clamp-1 font-medium leading-tight hover:underline">
              {product.name}
            </h3>
          </Link>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold">
            {formatCurrency(product.price, product.currency)}
          </span>
          <Button
            size="icon"
            className="h-8 w-8"
            disabled={product.available_stock <= 0}
            onClick={() => {
              addItem(product);
              toast.success(`${product.name} added to cart`);
            }}
            aria-label="Add to cart"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
