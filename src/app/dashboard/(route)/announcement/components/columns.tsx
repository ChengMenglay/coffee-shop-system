"use client";
import { ColumnDef } from "@tanstack/react-table";
import CellAction from "./cell-action";
import { usePermissions } from "@/hooks/usePermission";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

export type AnnouncementColumn = {
  id: string;
  title: string;
  content: string;
  image: string;
  isActive: boolean;
  createdAt: string;
};
const ActionCell = ({ row }: { row: { original: AnnouncementColumn } }) => {
  const { canPerformAction } = usePermissions();

  return (
    <CellAction
      canEdit={canPerformAction(["edit:announcement"])}
      canDelete={canPerformAction(["delete:announcement"])}
      data={row.original}
    />
  );
};

export const columns: ColumnDef<AnnouncementColumn>[] = [
  {
    accessorKey: "image",
    header: "Image",
    cell: ({ row }) => (
      <Image
        alt={row.original.title}
        width={100}
        height={100}
        src={`/uploads/${row.original.image}`}
        className="rounded-md"
      />
    ),
  },
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      return row.original.isActive ? (
        <Badge className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 border border-green-300">
          Available
        </Badge>
      ) : (
        <Badge className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 border border-red-300">
          Disable
        </Badge>
      );
    },
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
