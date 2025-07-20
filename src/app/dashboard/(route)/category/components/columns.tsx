"use client";
import { ColumnDef } from "@tanstack/react-table";
import CellAction from "./cell-action";
import { usePermissions } from "@/hooks/usePermission";

export type CategoryColumn = {
  id: string;
  name: string;
  createdAt: string;
};

export const columns: ColumnDef<CategoryColumn>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
    {
    accessorKey: "createdAt",
    header: "Create At",
  },
  {
    accessorKey: "Action",
    cell: ({ row }) => {
      const { canPerformAction } = usePermissions();
      return (
        <CellAction
          canEdit={canPerformAction(["edit:category"])}
          canDelete={canPerformAction(["delete:category"])}
          data={row.original}
        />
      );
    },
  },
];
