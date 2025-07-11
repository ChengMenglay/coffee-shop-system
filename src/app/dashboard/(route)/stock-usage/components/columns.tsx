"use client";
import { ColumnDef } from "@tanstack/react-table";
import CellAction from "./cell-action";
import { useSession } from "next-auth/react";
export type IngredientStockColumn = {
  id: string;
  ingredient: string;
  unit: string;
  quantity: number;
  status: string;
  note?: string;
  createdAt: string;
};

export function getColumns(
  userRole: string
): ColumnDef<IngredientStockColumn>[] {
  const baseColumns: ColumnDef<IngredientStockColumn>[] = [
    { accessorKey: "ingredient", header: "Ingredient" },
    { accessorKey: "quantity", header: "Qty" },
    { accessorKey: "unit", header: "Unit" },
    { accessorKey: "status", header: "Status" },
    { accessorKey: "note", header: "Note" },
    { accessorKey: "createdAt", header: "Create At" },
  ];
  if (userRole === "Admin") {
    baseColumns.push({
      accessorKey: "Action",
      cell: ({ row }) => <CellAction data={row.original} />,
    });
  }

  return baseColumns;
}
