"use client";
import { ColumnDef } from "@tanstack/react-table";
import CellAction from "./cell-action";
import { usePermissions } from "@/hooks/usePermission";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

export type ProductColumn = {
  id: string;
  name: string;
  price: string;
  image: string;
  category: string;
  status: boolean;
  discount: string;
  createdAt: string;
};

const ActionCell = ({ row }: { row: { original: ProductColumn } }) => {
  const { canPerformAction } = usePermissions();

  return (
    <CellAction
      canEdit={canPerformAction(["edit:product"])}
      canDelete={canPerformAction(["delete:product"])}
      data={row.original}
    />
  );
};

export const columns: ColumnDef<ProductColumn>[] = [
  {
    accessorKey: "image",
    header: "Image",
    cell: ({ row }) => (
      <Image
        alt={row.original.name}
        width={100}
        height={100}
        src={`/uploads/${row.original.image}`}
        className="rounded-md"
      />
    ),
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "price",
    header: "Price",
  },
  {
    accessorKey: "discount",
    header: "Discount",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      return row.original.status ? (
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
    cell: ({ row }) => <ActionCell row={row} />
  },
];
