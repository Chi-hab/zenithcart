"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/store/auth";
import { useHasMounted } from "@/hooks/use-has-mounted";

/** Client-side gate: only vendors/admins see dashboard content. */
export function DashboardGuard({ children }: { children: React.ReactNode }) {
  const mounted = useHasMounted();
  const { user, status } = useAuth();

  if (!mounted || status === "idle" || status === "loading") {
    return (
      <div className="flex h-[60vh] items-center justify-center text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <h2 className="text-xl font-semibold">Sign in to access the dashboard</h2>
        <Button asChild>
          <Link href="/login">Sign in</Link>
        </Button>
      </div>
    );
  }

  if (user.role !== "VENDOR" && user.role !== "ADMIN") {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <h2 className="text-xl font-semibold">Vendor access required</h2>
        <p className="max-w-sm text-muted-foreground">
          Your account is a customer account. Register as a vendor to manage
          products and inventory.
        </p>
        <Button asChild>
          <Link href="/products">Continue shopping</Link>
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
