import { PromotionType } from "@prisma/client";

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

export type Category={
  id:string;
  name:string;
}

export type Product = {
  id: string;
  categoryId: string;
  category?: Category;
  name: string;
  price: number ;
  discount: number | null;
  description: string;
  status: boolean;
  image: string;
  quantity?: number | null;
};

export type Promotion={
  id:string;
  name:string;
  type:PromotionType;
  buyQuantity?: number | null;
  freeQuantity?: number | null;
  discount?: number | null;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

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

// In your types.ts file, update the OrderItem interface:
export interface OrderItem {
  id: string;
  order: {
    id: string;
    displayId: number;
    createdAt: Date;
    note?: string | null;
    user: {
      id: string;
      name: string;
      phone: string;
      role: {
        id: string;
        name: string;
      };
    };
    orderStatus: string;
    paymentStatus: boolean;
    paymentMethod: string;
    discount: number;
    total: number;
  };
  productId: {
    id: string;
    categoryId: string;
    name: string;
    price: number;
    discount: number | null;
    description: string;
    status: boolean;
    image: string;
  };
  quantity: number;
  price: number;
  sizeId?: string | null;
  size?: {
    id: string;
    sizeName: string;
    priceModifier: number;
    productId: string;
    fullPrice: number;
  } | null;
  sugarId?: string | null;
  sugar?: string | null;
  iceId?: string | null;
  ice?: string | null;
  extraShotId?: string | null;
  extraShot?: {
    id: string;
    name: string;
    priceModifier: number;
  } | null;
  note?: string | null;
}

export type Size = {
  id: string;
  sizeName: string;
  priceModifier: number;
  productId: string;
  fullPrice: number;
};

export type Sugar={
  id: string;
  name: string;
  productId: string;
}

export type Ice = {
  id: string;
  name: string;
  productId: string;
};

export type ExtraShot = {
  id: string;
  name: string;
  priceModifier: number;
  productId: string;
};