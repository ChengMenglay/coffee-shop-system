"use client";
import { ColumnDef } from "@tanstack/react-table";
import CellAction from "./cell-action";
import { usePermissions } from "@/hooks/usePermission";

export type SugarColumn = {
  id: string;
  name: string;
  product: string;
  createdAt: string;
};
const ActionCell = ({ row }: { row: { original: SugarColumn } }) => {
  const { canPerformAction } = usePermissions();

  return (
    <CellAction
      canEdit={canPerformAction(["edit:sugar"])}
      canDelete={canPerformAction(["delete:sugar"])}
      data={row.original}
    />
  );
};

export const columns: ColumnDef<SugarColumn>[] = [
  {
    accessorKey: "name",
    header: "Sugar",
  },
  { accessorKey: "product", header: "Product" },
  { accessorKey: "createdAt", header: "Create At" },
  {
    accessorKey: "Action",
    cell: ({ row }) => <ActionCell row={row} />,
  },
];
