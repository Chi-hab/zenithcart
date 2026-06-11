"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { isAxiosError } from "axios";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/store/cart";
import { useAuth } from "@/store/auth";
import { usePlaceOrder } from "@/hooks/use-orders";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { formatCurrency } from "@/lib/utils";

const checkoutSchema = z.object({
  full_name: z.string().min(2, "Please enter your full name"),
  line1: z.string().min(3, "Street address is required"),
  line2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().optional(),
  postal_code: z.string().min(2, "Postal code is required"),
  country: z.string().length(2, "Use a 2-letter country code"),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const mounted = useHasMounted();
  const status = useAuth((s) => s.status);
  const items = useCart((s) => s.items);
  const subtotal = useCart((s) => s.subtotal());
  const clear = useCart((s) => s.clear);
  const placeOrder = usePlaceOrder();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { country: "US" },
  });

  const onSubmit = async (values: CheckoutForm) => {
    try {
      const order = await placeOrder.mutateAsync({
        address: {
          line1: values.line1,
          line2: values.line2,
          city: values.city,
          state: values.state,
          postal_code: values.postal_code,
          country: values.country.toUpperCase(),
        },
        lines: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
      });
      clear();
      toast.success(`Order ${order.order_number} placed and paid.`);
      router.push("/account/orders");
    } catch (err) {
      const detail = isAxiosError(err)
        ? (err.response?.data?.detail as string | undefined)
        : undefined;
      toast.error(detail ?? "Could not place your order. Please try again.");
    }
  };

  if (mounted && status === "unauthenticated") {
    return (
      <div className="container flex flex-col items-center gap-4 py-24 text-center">
        <h1 className="text-2xl font-semibold">Sign in to check out</h1>
        <p className="max-w-sm text-muted-foreground">
          You need an account to place an order and track its status.
        </p>
        <Button asChild>
          <Link href="/login">Sign in</Link>
        </Button>
      </div>
    );
  }

  if (mounted && items.length === 0) {
    return (
      <div className="container py-24 text-center text-muted-foreground">
        Your cart is empty.
      </div>
    );
  }

  const field = (
    name: keyof CheckoutForm,
    label: string,
    placeholder?: string,
  ) => (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} placeholder={placeholder} {...register(name)} />
      {errors[name] && (
        <p className="text-xs text-destructive">{errors[name]?.message}</p>
      )}
    </div>
  );

  return (
    <div className="container py-10">
      <h1 className="mb-8 text-3xl font-semibold tracking-tight">Checkout</h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid gap-8 lg:grid-cols-[1fr_360px]"
      >
        <Card>
          <CardContent className="space-y-4 p-6">
            <h2 className="font-semibold">Shipping details</h2>
            {field("full_name", "Full name", "Jane Doe")}
            {field("line1", "Address line 1", "123 Market St")}
            {field("line2", "Address line 2 (optional)")}
            <div className="grid grid-cols-2 gap-4">
              {field("city", "City")}
              {field("state", "State / Region")}
            </div>
            <div className="grid grid-cols-2 gap-4">
              {field("postal_code", "Postal code")}
              {field("country", "Country (ISO-2)", "US")}
            </div>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardContent className="space-y-4 p-6">
            <h2 className="font-semibold">Order summary</h2>
            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex justify-between text-sm"
                >
                  <span className="text-muted-foreground">
                    {item.quantity} × {item.name}
                  </span>
                  <span>
                    {formatCurrency(item.price * item.quantity, item.currency)}
                  </span>
                </div>
              ))}
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={placeOrder.isPending}
            >
              {placeOrder.isPending ? "Placing order…" : "Place order"}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
