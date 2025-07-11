"use client";

import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
export type OrderColumn = {
  id: string;
  name: string;
  role: string;
  phone: string;
  products: string;
  totalPrice: string;
  isPaid: boolean;
  createdAt: string;
  status: string;
};

export const columns: ColumnDef<OrderColumn>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "role",
    header: "Role",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "products",
    header: "Products",
  },
  {
    accessorKey: "totalPrice",
    header: "Total Price",
  },
  {
    accessorKey: "isPaid",
    cell: ({ row }) => (
      <Badge variant={row.original.isPaid ? "default" : "outline"}>
        {row.original.isPaid ? "Paid" : "Unpaid"}
      </Badge>
    ),
  },
  {
    accessorKey: "status",
    cell: ({ row }) => (
      <Badge
        variant={
          row.original.status === "Completed"
            ? "default"
            : row.original.status === "Pending"
            ? "outline"
            : "destructive"
        }
      >
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Date",
  },
];
