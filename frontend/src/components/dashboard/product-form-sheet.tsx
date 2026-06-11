"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { isAxiosError } from "axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCategories, useCreateProduct } from "@/hooks/use-products";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  slug: z
    .string()
    .min(2, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and dashes only"),
  sku: z.string().min(1, "SKU is required"),
  category: z.string().min(1, "Pick a category"),
  price: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Enter a valid price (e.g. 19.99)"),
  currency: z.string().length(3, "3-letter code"),
  description: z.string().optional(),
  is_active: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export function ProductFormSheet() {
  const [open, setOpen] = useState(false);
  const { data: categories } = useCategories();
  const createProduct = useCreateProduct();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { currency: "USD", is_active: true },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await createProduct.mutateAsync({
        name: values.name,
        slug: values.slug,
        sku: values.sku,
        category: values.category,
        price: values.price,
        currency: values.currency.toUpperCase(),
        description: values.description,
        is_active: values.is_active,
      });
      toast.success("Product created.");
      reset();
      setOpen(false);
    } catch (err) {
      const data = isAxiosError(err) ? err.response?.data : undefined;
      const detail =
        typeof data === "object" && data
          ? Object.values(data).flat().join(" ")
          : undefined;
      toast.error(detail ?? "Could not create the product.");
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" /> New product
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>New product</SheetTitle>
          <SheetDescription>
            Add a product to your catalog. It goes live immediately when active.
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-6 flex flex-1 flex-col gap-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Aurora Wireless Headphones"
              {...register("name", {
                onChange: (e) => setValue("slug", slugify(e.target.value)),
              })}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" placeholder="aurora-wireless-headphones" {...register("slug")} />
            {errors.slug && (
              <p className="text-xs text-destructive">{errors.slug.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="sku">SKU</Label>
              <Input id="sku" placeholder="AUR-001" {...register("sku")} />
              {errors.sku && (
                <p className="text-xs text-destructive">{errors.sku.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                {...register("category")}
              >
                <option value="">Select…</option>
                {categories?.results.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-xs text-destructive">
                  {errors.category.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="price">Price</Label>
              <Input id="price" placeholder="19.99" {...register("price")} />
              {errors.price && (
                <p className="text-xs text-destructive">
                  {errors.price.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="currency">Currency</Label>
              <Input id="currency" placeholder="USD" {...register("currency")} />
              {errors.currency && (
                <p className="text-xs text-destructive">
                  {errors.currency.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              rows={4}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              placeholder="What makes this product great?"
              {...register("description")}
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="h-4 w-4" {...register("is_active")} />
            Active (visible in the storefront)
          </label>

          <Button
            type="submit"
            className="mt-2"
            disabled={createProduct.isPending}
          >
            {createProduct.isPending ? "Creating…" : "Create product"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
