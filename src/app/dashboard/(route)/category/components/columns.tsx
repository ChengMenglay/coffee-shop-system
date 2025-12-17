"use client";
import { ColumnDef } from "@tanstack/react-table";
import CellAction from "./cell-action";
import { usePermissions } from "@/hooks/usePermission";
import Image from "next/image";

export type CategoryColumn = {
  id: string;
  name: string;
  image: string;
  createdAt: string;
};
const ActionCell = ({ row }: { row: { original: CategoryColumn } }) => {
  const { canPerformAction } = usePermissions();

  return (
    <CellAction
      canEdit={canPerformAction(["edit:category"])}
      canDelete={canPerformAction(["delete:category"])}
      data={row.original}
    />
  );
};

export const columns: ColumnDef<CategoryColumn>[] = [
  {
      accessorKey: "image",
      header: "Image",
      cell: ({ row }) => (
        <Image
          alt={row.original.name}
          width={100}
          height={100}
          src={`${row.original.image}`}
          className="rounded-md"
        />
      ),
    },
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
    cell: ({ row }) => <ActionCell row={row} />,
  },
];
