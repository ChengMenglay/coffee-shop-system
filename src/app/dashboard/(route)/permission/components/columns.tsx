"use client";
import { ColumnDef } from "@tanstack/react-table";
import CellAction from "./cell-action";
import { usePermissions } from "@/hooks/usePermission";

export type PermissionColumn = {
  id: string;
  name: string;
  key: string;
};
const ActionCell = ({ row }: { row: { original: PermissionColumn } }) => {
  const { canPerformAction } = usePermissions();

  return (
    <CellAction
      canEdit={canPerformAction(["edit:permission"])}
      canDelete={canPerformAction(["delete:permission"])}
      data={row.original}
    />
  );
};

export const columns: ColumnDef<PermissionColumn>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  { accessorKey: "key", header: "Key" },
  {
    accessorKey: "Action",
    cell: ({ row }) => <ActionCell row={row} />
  },
];
