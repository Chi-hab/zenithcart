import { api, API_URL } from "./axios";
import type {
  Address,
  AuthTokens,
  Cart,
  CartItem,
  Category,
  InventoryRecord,
  Order,
  Paginated,
  Product,
  User,
} from "@/types";

// ----- Server-side fetch helpers (used by SSR/SSG pages) ----------------- //

// Server-rendered pages run inside the Next.js container, where `localhost`
// resolves to the container itself — not the Django service. Use the internal
// service URL when provided (e.g. http://web:8000/api/v1 under docker-compose),
// and fall back to the public URL for plain local development.
const SERVER_API_URL = process.env.INTERNAL_API_URL ?? API_URL;

export async function fetchProducts(
  searchParams: Record<string, string> = {},
): Promise<Paginated<Product>> {
  const qs = new URLSearchParams(searchParams).toString();
  const res = await fetch(`${SERVER_API_URL}/products/${qs ? `?${qs}` : ""}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error("Failed to load products");
  return res.json();
}

export async function fetchProductBySlug(
  slug: string,
): Promise<Product | null> {
  const res = await fetch(`${SERVER_API_URL}/products/${slug}/`, {
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to load product");
  return res.json();
}

export async function fetchTopSellers(): Promise<Product[]> {
  try {
    const res = await fetch(`${SERVER_API_URL}/products/top_sellers/`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    // Backend may be unavailable (e.g. at build time) — degrade gracefully.
    return [];
  }
}

export async function fetchCategoryTree(): Promise<Category[]> {
  try {
    const res = await fetch(`${SERVER_API_URL}/categories/tree/`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

// ----- Client-side API (used by React Query hooks) ----------------------- //

export const authApi = {
  register: (payload: {
    email: string;
    full_name: string;
    password: string;
    role?: string;
  }) => api.post<User>("/auth/register/", payload).then((r) => r.data),
  login: (payload: { email: string; password: string }) =>
    api.post<AuthTokens>("/auth/login/", payload).then((r) => r.data),
  logout: (refresh: string) =>
    api.post("/auth/logout/", { refresh }).then((r) => r.data),
  me: () => api.get<User>("/auth/me/").then((r) => r.data),
};

export const accountApi = {
  createAddress: (payload: Omit<Address, "id">) =>
    api.post<Address>("/auth/addresses/", payload).then((r) => r.data),
};

export interface ProductInput {
  name: string;
  slug: string;
  sku: string;
  category: string;
  price: string;
  currency: string;
  description?: string;
  is_active: boolean;
}

export const productApi = {
  list: (params?: Record<string, string>) =>
    api
      .get<Paginated<Product>>("/products/", { params })
      .then((r) => r.data),
  create: (payload: ProductInput) =>
    api.post<Product>("/products/", payload).then((r) => r.data),
};

export const categoryApi = {
  list: () =>
    api.get<Paginated<Category>>("/categories/").then((r) => r.data),
};

export const cartApi = {
  get: () => api.get<Cart>("/cart/").then((r) => r.data),
  addItem: (payload: { product: string; quantity: number }) =>
    api.post<CartItem>("/cart/items/", payload).then((r) => r.data),
  removeItem: (id: string) =>
    api.delete(`/cart/items/${id}/`).then((r) => r.data),
};

export const orderApi = {
  list: () => api.get<Paginated<Order>>("/orders/").then((r) => r.data),
  checkout: (payload: { shipping_address: string; tax_rate?: string }) =>
    api.post<Order>("/checkout/", payload).then((r) => r.data),
  pay: (orderId: string) =>
    api.post(`/orders/${orderId}/pay/`).then((r) => r.data),
};

export const inventoryApi = {
  list: () =>
    api
      .get<Paginated<InventoryRecord>>("/inventory/")
      .then((r) => r.data),
};
