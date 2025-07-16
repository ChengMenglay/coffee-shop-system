"use client";
import { ColumnDef } from "@tanstack/react-table";
import CellAction from "./cell-action";

export type PurchaseColumn = {
  id: string;
  ingredient: string;
  price: string;
  quantity: string;
  supplier: string;
  createdAt: string;
};

export const columns: ColumnDef<PurchaseColumn>[] = [
  {
    accessorKey: "ingredient",
    header: "Ingredient",
  },
  { accessorKey: "price", header: "Price" },
  {
    accessorKey: "quantity",
    header: "Quantity",
  },
  { accessorKey: "supplier", header: "Supplier" },
  { accessorKey: "createdAt", header: "Create At" },
  {
    accessorKey: "Action",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
