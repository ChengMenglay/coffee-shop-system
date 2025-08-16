"use client";
import { ColumnDef } from "@tanstack/react-table";
import CellAction from "./cell-action";
import { usePermissions } from "@/hooks/usePermission";
import { PromotionType } from "@prisma/client";
import { Badge } from "@/components/ui/badge";

export type PromotionColumn = {
  id: string;
  name: string;
  type: PromotionType;
  buyQuantity?: number;
  freeQuantity?: number;
  discount?: number;
  startDate: Date;
  endDate: Date;
  showDiscount: string;
  isActive: boolean;
  createdAt: string;
};
const ActionCell = ({ row }: { row: { original: PromotionColumn } }) => {
  const { canPerformAction } = usePermissions();

  return (
    <CellAction
      canEdit={canPerformAction(["edit:promotion"])}
      canDelete={canPerformAction(["delete:promotion"])}
      data={row.original}
    />
  );
};

export const columns: ColumnDef<PromotionColumn>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      return (
        <Badge
          variant={
            row.original.type === PromotionType.BUY_X_GET_Y
              ? "outline"
              : "secondary"
          }
        >
          {row.original.type}
        </Badge>
      );
    },
  },
    {
    accessorKey: "showDiscount",
    header: "Show Discount",
  },
  {
    accessorKey: "startDate",
    header: "Start Date",
    cell: ({ row }) => {
      return <span>{row.original.startDate.toLocaleDateString()}</span>;
    },
  },
  {
    accessorKey: "endDate",
    header: "End Date",
    cell: ({ row }) => {
      return <span>{row.original.endDate.toLocaleDateString()}</span>;
    },
  },
  {
    accessorKey: "isActive",
    header: "Is Active",
    cell: ({ row }) => {
      return (
        <Badge variant={row.original.isActive ? "secondary" : "destructive"}>
          {row.original.isActive ? "Yes" : "No"}
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
