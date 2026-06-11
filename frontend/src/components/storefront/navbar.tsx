import Link from "next/link";
import { Sparkles } from "lucide-react";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { CartDrawer } from "@/components/storefront/cart-drawer";
import { UserMenu } from "@/components/storefront/user-menu";

const links = [
  { href: "/products", label: "Shop" },
  { href: "/products?ordering=-sales_count", label: "Best sellers" },
  { href: "/dashboard", label: "Sell" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="text-lg tracking-tight">ZenithCart</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <CartDrawer />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
