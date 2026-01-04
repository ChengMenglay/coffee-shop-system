export type FeedbackColumn = {
  id: string;
  userId: string;
  userName: string;
  orderId: string | null;
  orderDisplayId: number | null;
  category: string;
  description: string;
  images: string[];
  status: string;
  updatedById: string | null;
  updatedByName: string | null;
  createdAt: string;
};
