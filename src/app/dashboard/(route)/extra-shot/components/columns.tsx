"use client";
import { ColumnDef } from "@tanstack/react-table";
import CellAction from "./cell-action";
import { usePermissions } from "@/hooks/usePermission";

export type ExtraShotColumn = {
  id: string;
  name: string;
  product: string;
  priceModifier: string;
  createdAt: string;
};

export const columns: ColumnDef<ExtraShotColumn>[] = [
  {
    accessorKey: "name",
    header: "Extra Shot",
  },
  { accessorKey: "product", header: "Product" },
  { accessorKey: "priceModifier", header: "Price Modifier" },
  { accessorKey: "createdAt", header: "Create At" },

  {
    accessorKey: "Action",
    cell: ({ row }) => {
      const { canPerformAction } = usePermissions();
      return (
        <CellAction
          canEdit={canPerformAction(["edit:extra-shot"])}
          canDelete={canPerformAction(["delete:extra-shot"])}
          data={row.original}
        />
      );
    },
  },
];
