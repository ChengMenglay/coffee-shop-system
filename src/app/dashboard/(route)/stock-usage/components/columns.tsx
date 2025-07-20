"use client";
import { ColumnDef } from "@tanstack/react-table";
import CellAction from "./cell-action";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/hooks/usePermission";
export type IngredientStockColumn = {
  id: string;
  ingredient: string;
  unit: string;
  quantity: number;
  status: string;
  note?: string;
  name: string;
  createdAt: string;
};

export function getColumns(
  userRole: string
): ColumnDef<IngredientStockColumn>[] {
  const baseColumns: ColumnDef<IngredientStockColumn>[] = [
    { accessorKey: "ingredient", header: "Ingredient" },
    { accessorKey: "quantity", header: "Qty" },
    { accessorKey: "unit", header: "Unit" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <span
            className={cn(
              "px-2 py-1 rounded-full text-xs font-semibold",
              status === "Use"
                ? "bg-green-100 text-green-800"
                : status === "Expired"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
            )}
          >
            {status}
          </span>
        );
      },
    },
    { accessorKey: "note", header: "Note" },
    { accessorKey: "name", header: "Create By" },
    { accessorKey: "createdAt", header: "Create At" },
    {
      accessorKey: "Action",
      cell: ({ row }) => {
        const { canPerformAction } = usePermissions();
        return (
          <CellAction
            canEdit={canPerformAction(["edit:stock"])}
            canDelete={canPerformAction(["delete:stock"])}
            data={row.original}
          />
        );
      },
    },
  ];

  return baseColumns;
}
