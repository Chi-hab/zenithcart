import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ImageIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AddToCartButton } from "@/components/storefront/add-to-cart-button";
import { fetchProductBySlug } from "@/lib/api/endpoints";
import { formatCurrency } from "@/lib/utils";

interface Props {
  params: { slug: string };
}

// Server-side rendered per request for accurate stock + SEO.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await fetchProductBySlug(params.slug).catch(() => null);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: product.description?.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.description?.slice(0, 160),
      images: product.images?.[0]?.image
        ? [{ url: product.images[0].image }]
        : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const product = await fetchProductBySlug(params.slug).catch(() => null);
  if (!product) notFound();

  const primary =
    product.images?.find((img) => img.is_primary) ?? product.images?.[0];
  const inStock = product.available_stock > 0;

  return (
    <div className="container py-10">
      <Link
        href="/products"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back to products
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border bg-muted">
          <div className="aspect-square">
            {primary ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={primary.image}
                alt={primary.alt_text || product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <ImageIcon className="h-16 w-16 opacity-40" />
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col">
          {product.category_detail && (
            <span className="text-sm uppercase tracking-wide text-muted-foreground">
              {product.category_detail.name}
            </span>
          )}
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            {product.name}
          </h1>
          <div className="mt-3 flex items-center gap-3">
            <span className="text-2xl font-semibold">
              {formatCurrency(product.price, product.currency)}
            </span>
            {inStock ? (
              <Badge variant="success">
                {product.available_stock} in stock
              </Badge>
            ) : (
              <Badge variant="destructive">Sold out</Badge>
            )}
          </div>

          <Separator className="my-6" />

          <p className="whitespace-pre-line text-muted-foreground">
            {product.description || "No description provided."}
          </p>

          <div className="mt-8">
            <AddToCartButton product={product} />
          </div>

          <dl className="mt-8 grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-muted-foreground">SKU</dt>
              <dd className="font-medium">{product.sku}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Currency</dt>
              <dd className="font-medium">{product.currency}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
