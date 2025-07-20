"use client";
import { ColumnDef } from "@tanstack/react-table";
import CellAction from "./cell-action";
import { usePermissions } from "@/hooks/usePermission";

export type PurchaseColumn = {
  id: string;
  ingredient: string;
  price: string;
  purchasedBy:string;
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
    {
    accessorKey: "purchasedBy",
    header: "Purchase By",
  },
  { accessorKey: "supplier", header: "Supplier" },
  { accessorKey: "createdAt", header: "Create At" },
{
    accessorKey: "Action",
    cell: ({ row }) => {
      const { canPerformAction } = usePermissions();
      return (
        <CellAction
          canEdit={canPerformAction(["edit:purchases"])}
          canDelete={canPerformAction(["delete:purchases"])}
          data={row.original}
        />
      );
    },
  },
];
