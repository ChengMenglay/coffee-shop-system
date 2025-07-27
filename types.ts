export type Notification = {
  id: string;
  name: string;
  role: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
};
export type Role = {
  id: string;
  name: string;
};

export type User = {
  id: string;
  name: string;
  phone: string;
  role: Role;
};
export type Purchase = {
  id: string;
  ingredientId: string;
  userId: string;
  supplierId: string;
  quantity: number;
  price: number;
};

export type Product = {
  id: string;
  categoryId: string;
  name: string;
  price: number;
  discount: number | null;
  description: string;
  status: boolean;
  image: string;
  quantity?: number | null;
};

export type Order = {
  id: string;
  user: User;
  orderStatus: string;
  paymentStatus: boolean;
  paymentMethod: string;
  discount: number;
  displayId:number;
  total: number;
};

export type OrderItem = {
  id: string;
  order: Order;
  productId: Product;
  quantity: number;
  price: number;
  size: Size;
  sugar: "0" | "25" | "50" | "75" | "100";
  note: string | null;
};

export type Size = {
  id: string;
  sizeName: string;
  priceModifier: number;
  productId: string;
  fullPrice: number;
};
