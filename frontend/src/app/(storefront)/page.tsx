import Link from "next/link";
import { ArrowRight, PackageCheck, ShieldCheck, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/storefront/product-card";
import { fetchCategoryTree, fetchTopSellers } from "@/lib/api/endpoints";

// Statically generated landing page (revalidated periodically) for fast loads.
export const revalidate = 300;

const perks = [
  {
    icon: Truck,
    title: "Fast fulfilment",
    description: "Async order processing keeps checkout instant.",
  },
  {
    icon: ShieldCheck,
    title: "Secure by design",
    description: "JWT auth, scoped rate limiting, and HTTPS everywhere.",
  },
  {
    icon: PackageCheck,
    title: "Real-time inventory",
    description: "Stock reservations prevent overselling.",
  },
];

export default async function LandingPage() {
  const [topSellers, categories] = await Promise.all([
    fetchTopSellers(),
    fetchCategoryTree(),
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_50%_0%,hsl(var(--primary)/0.18),transparent)]" />
        <div className="container flex flex-col items-center gap-6 py-24 text-center md:py-32">
          <Badge variant="secondary" className="gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" /> New season
            drop
          </Badge>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
            Premium commerce,{" "}
            <span className="bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">
              built to scale
            </span>
          </h1>
          <p className="max-w-xl text-balance text-muted-foreground md:text-lg">
            ZenithCart pairs a lightning-fast storefront with a powerful vendor
            dashboard and real-time inventory — all in one decoupled platform.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/products">
                Shop now <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/dashboard">Become a vendor</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="container py-14">
          <div className="flex flex-wrap gap-3">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/products?category=${c.slug}`}
                className="rounded-full border px-4 py-2 text-sm transition-colors hover:bg-accent"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Top sellers */}
      <section className="container py-14">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Best sellers
            </h2>
            <p className="text-muted-foreground">
              The products our customers love most.
            </p>
          </div>
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link href="/products">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {topSellers.length === 0 ? (
          <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
            No products yet — connect the backend and add some inventory.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {topSellers.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Perks */}
      <section className="border-t bg-muted/30">
        <div className="container grid gap-8 py-14 sm:grid-cols-3">
          {perks.map((perk) => (
            <div key={perk.title} className="flex gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <perk.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium">{perk.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {perk.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
