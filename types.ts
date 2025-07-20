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
export type Purchase = {
  id: string;
  ingredientId: string;
  userId: string;
  supplierId: string;
  quantity: number;
  price: number;
};
