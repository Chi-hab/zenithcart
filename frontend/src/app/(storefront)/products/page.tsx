import type { Metadata } from "next";

import { ProductBrowser } from "@/components/storefront/product-browser";

export const metadata: Metadata = {
  title: "Shop all products",
};

export default function ProductsPage() {
  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">All products</h1>
        <p className="text-muted-foreground">
          Browse the full ZenithCart catalog.
        </p>
      </div>
      <ProductBrowser />
    </div>
  );
}
