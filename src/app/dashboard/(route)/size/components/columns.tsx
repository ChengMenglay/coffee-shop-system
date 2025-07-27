"use client";
import { ColumnDef } from "@tanstack/react-table";
import CellAction from "./cell-action";
import { usePermissions } from "@/hooks/usePermission";

export type SizeColumn = {
  id: string;
 sizeName:string;
 product:string;
 priceModifier:string;
 fullPrice:string;
 createdAt:string;
};

export const columns: ColumnDef<SizeColumn>[] = [
  {
    accessorKey: "sizeName",
    header: "Size",
  },
  { accessorKey: "product", header: "Product" },
  {
    accessorKey: "priceModifier",
    header: "Price Modifier",
  },
    {
    accessorKey: "fullPrice",
    header: "Full Price",
  },
  { accessorKey: "createdAt", header: "Create At" },
{
    accessorKey: "Action",
    cell: ({ row }) => {
      const { canPerformAction } = usePermissions();
      return (
        <CellAction
          canEdit={canPerformAction(["edit:size"])}
          canDelete={canPerformAction(["delete:size"])}
          data={row.original}
        />
      );
    },
  },
];