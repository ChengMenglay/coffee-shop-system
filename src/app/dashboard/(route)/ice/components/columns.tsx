"use client";
import { ColumnDef } from "@tanstack/react-table";
import CellAction from "./cell-action";
import { usePermissions } from "@/hooks/usePermission";

export type IceColumn = {
  id: string;
  name: string;
  product: string;
  createdAt: string;
};
const ActionCell = ({ row }: { row: { original: IceColumn } }) => {
  const { canPerformAction } = usePermissions();

  return (
    <CellAction
      canEdit={canPerformAction(["edit:ice"])}
      canDelete={canPerformAction(["delete:ice"])}
      data={row.original}
    />
  );
};

export const columns: ColumnDef<IceColumn>[] = [
  {
    accessorKey: "name",
    header: "Ice",
  },
  { accessorKey: "product", header: "Product" },
  { accessorKey: "createdAt", header: "Create At" },
  {
    accessorKey: "Action",
    cell: ({ row }) => <ActionCell row={row} />,
  },
];
