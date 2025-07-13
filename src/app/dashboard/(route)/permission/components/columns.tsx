"use client";
import { ColumnDef } from "@tanstack/react-table";
import CellAction from "./cell-action";

export type PermissionColumn = {
  id: string;
  name: string;
  key: string;
};

export const columns: ColumnDef<PermissionColumn>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  { accessorKey: "key", header: "Key" },
  {
    accessorKey: "Action",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
