"use client";
import { ColumnDef } from "@tanstack/react-table";
import CellAction from "./cell-action";

export type IngredientColumn = {
  id: string;
  name: string;
  stock: number;
  unit: string;
  lowStockThreshold: number;
  createdAt:string;
};

export const columns: ColumnDef<IngredientColumn>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  { accessorKey: "stock", header: "Stock" },
  {
    accessorKey: "unit",
    header: "Unit",
  },
  { accessorKey: "lowStockThreshold", header: "Low Stock" },
  { accessorKey: "createdAt", header: "Create At" },
  {
    accessorKey: "Action",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
