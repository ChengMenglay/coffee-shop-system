"use client";
import { ColumnDef } from "@tanstack/react-table";
import CellAction from "./cell-action";

export type AccountColumn = {
  id: string;
  name: string;
  role: string;
  phone: string;
  createdAt: string;
};

export const columns: ColumnDef<AccountColumn>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  { accessorKey: "role", header: "Role" },
  { accessorKey: "phone", header: "Phone" },
  { accessorKey: "createdAt", header: "Created At" },
  {
    accessorKey: "Action",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
