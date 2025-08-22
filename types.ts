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

export type Category = {
  id: string;
  name: string;
};

export type Product = {
  id: string;
  categoryId: string;
  category?: Category;
  name: string;
  price: number;
  discount: number | null;
  description: string;
  status: boolean;
  image: string;
  quantity?: number | null;
};

export type Promotion = {
  id: string;
  name: string;
  type: PromotionType;
  buyQuantity?: number | null;
  freeQuantity?: number | null;
  discount?: number | null;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
};

export type Order = {
  id: string;
  user: User;
  orderStatus: string;
  paymentStatus: boolean;
  paymentMethod: string;
  discount: number;
  displayId: number;
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

export type Sugar = {
  id: string;
  name: string;
  productId: string;
};

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

export interface InventoryData {
  id: string;
  isLow: boolean;
  name: string;
  physicalCount: number;
  threshold: number;
  unit: string;
  currentStock: number;
  discrepancy: number;
}

export interface CashCountData {
  cashCountData: CashCountData;
  totalCashSales: number;
  totalCashOrders: number;
  expectedCash: number;
  denominations: Array<{
    value: number;
    name: string;
    count: number;
  }>;
  orders: Array<{
    id: string;
    displayId: string;
    total: number;
    createdAt: Date;
  }>;
}

export interface PaymentValidationData {
  aba: {
    difference: number;
    enteredAmount: number;
    systemTotal: number;
  };
  allPaymentsValidated?: boolean;
  cash: {
    bills: {
      fifties: number;
      fives: number;
      hundreds: number;
      ones: number;
      tens: number;
      twenties: number;
    };
    coins: {
      quarters: number;
      dimes: number;
      nickels: number;
      pennies: number;
    };
    difference: number;
    systemTotal: number;
    totalCounted: number;
  };
  creditCard: {
    difference: number;
    enteredAmount: number;
    systemTotal: number;
  };
  notes?: string;
}

export interface SaleReportData {
  id: string;
  createdAt: Date;
  date: Date;
  totalSales: number;
  totalOrders: number;
  totalCustomers: number;
  cashSales: number;
  abaSales: number;
  creditCardSales: number;
  topProducts: string | null;
  promotionsUsed: string | null;
  lowStockItems: string | null;
  hourlyBreakdown: string | null;
  notes: string | null;
  closedBy: string | null;
  closedAt: Date;
}

export interface CheckListdataType {
  cashCountData: PaymentValidationData | null;
  inventoryData: {
    completed: boolean;
    items: InventoryData[];
    lowStockCount: number;
    notes?: string;
    totalDiscrepancies: number;
  };
  salesData: {
    hourlyBreakDown: { hour: string; orders: number; revenue: number }[];
    lowStockItems: { name: string; currentStock: number; threshold: number }[];
    totalSales: number;
    totalOrders: number;
    totalCustomers: number;
    paymentMethods: {
      cash: number;
      creditCard: number;
      aba: number;
    };
    topProducts: { name: string; quantity: number; revenue: number }[];
    promotionsUsed: { name: string; count: number; totalDiscount: number }[];
  };
  paymentData: {
    cash: number;
    creditCard: number;
    aba: number;
  };
}
