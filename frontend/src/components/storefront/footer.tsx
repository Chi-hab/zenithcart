import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container flex flex-col items-center justify-between gap-4 py-8 text-sm text-muted-foreground sm:flex-row">
        <p>© {new Date().getFullYear()} ZenithCart. All rights reserved.</p>
        <nav className="flex gap-6">
          <Link href="/products" className="hover:text-foreground">
            Shop
          </Link>
          <Link href="/dashboard" className="hover:text-foreground">
            Sell
          </Link>
          <Link href="/login" className="hover:text-foreground">
            Account
          </Link>
        </nav>
      </div>
    </footer>
  );
}
