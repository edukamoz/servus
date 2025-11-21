export type OrderStatus = "draft" | "open" | "completed" | "paid";

export interface Customer {
  id: string;
  name: string;
  address: string;
  phone: string;
}

export interface OrderItem {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
  type: "service" | "material";
}

export interface UserProfile {
  businessName: string;
  phone: string;
  pixKey: string;
  address: string;
  email: string;
  logoUrl?: string;
  cnpj?: string;
  plan?: "free" | "pro";
}

export interface OrderPhoto {
  id: string;
  url: string;
  type: "before" | "after"; // Antes ou Depois
  caption?: string; // Legenda opcional
  createdAt: string;
}

export interface WorkOrder {
  id: string;
  userId: string;
  customerId: string;
  customer_name: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  date: string;
  createdAt?: any;
  signatureUrl?: string;
  photos?: OrderPhoto[];
}

export interface CatalogItem {
  id: string;
  userId: string;
  title: string;
  unit_price: number;
  type: "service" | "material";
}
