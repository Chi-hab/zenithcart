export type UserRole = "CUSTOMER" | "VENDOR" | "ADMIN";

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent: string | null;
  is_active: boolean;
  children?: Category[];
}

export interface ProductImage {
  id: string;
  image: string;
  alt_text: string;
  is_primary: boolean;
  position: number;
}

export interface Product {
  id: string;
  vendor: string;
  category: string;
  category_detail?: Category;
  name: string;
  slug: string;
  description: string;
  price: string;
  currency: string;
  sku: string;
  is_active: boolean;
  sales_count: number;
  images: ProductImage[];
  available_stock: number;
  created_at: string;
}

export interface CartItem {
  id: string;
  product: string;
  product_detail?: Product;
  quantity: number;
  line_total: string;
}

export interface OrderItem {
  id: string;
  product: string;
  product_detail?: Product;
  quantity: number;
  unit_price: string;
  line_total: string;
}

export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export interface Order {
  id: string;
  order_number: string;
  status: OrderStatus;
  shipping_address: string;
  items: OrderItem[];
  subtotal: string;
  tax: string;
  total: string;
  created_at: string;
}

export interface InventoryRecord {
  id: string;
  product: string;
  product_name: string;
  warehouse: string;
  quantity: number;
  reserved: number;
  reorder_level: number;
  available: number;
  needs_reorder: boolean;
}

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface AuthTokens {
  access: string;
  refresh: string;
}
