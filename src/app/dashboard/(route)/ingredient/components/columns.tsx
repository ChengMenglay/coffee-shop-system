"use client";
import { ColumnDef } from "@tanstack/react-table";
import CellAction from "./cell-action";
import { usePermissions } from "@/hooks/usePermission";

export type IngredientColumn = {
  id: string;
  name: string;
  stock: number;
  unit: string;
  lowStockThreshold: number;
  createdAt: string;
};

const ActionCell = ({ row }: { row: { original: IngredientColumn } }) => {
  const { canPerformAction } = usePermissions();

  return (
    <CellAction
      canEdit={canPerformAction(["edit:ingredient"])}
      canDelete={canPerformAction(["delete:ingredient"])}
      data={row.original}
    />
  );
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
    cell: ({ row }) => <ActionCell row={row} />,
  },
];
