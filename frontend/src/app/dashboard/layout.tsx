import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardGuard } from "@/components/dashboard/guard";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { UserMenu } from "@/components/storefront/user-menu";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b px-6">
          <span className="text-sm text-muted-foreground">
            Vendor Dashboard
          </span>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <UserMenu />
          </div>
        </header>
        <main className="flex-1 p-6">
          <DashboardGuard>{children}</DashboardGuard>
        </main>
      </div>
    </div>
  );
}
