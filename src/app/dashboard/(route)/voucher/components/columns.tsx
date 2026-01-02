"use client";
import { ColumnDef } from "@tanstack/react-table";
import CellAction from "./cell-action";
import { usePermissions } from "@/hooks/usePermission";
import { VoucherDiscountType } from "@prisma/client";
import { Badge } from "@/components/ui/badge";

export type VoucherColumn = {
  id: string;
  code: string;
  discountType: VoucherDiscountType;
  discountValue: String;
  perUserLimit: number | null;
  discount?: number;
  startDate: Date;
  endDate: Date;
  usageLimit: number | null;
  isActive: boolean;
  createdAt: string;
};
const ActionCell = ({ row }: { row: { original: VoucherColumn } }) => {
  const { canPerformAction } = usePermissions();

  return (
    <CellAction
      canEdit={canPerformAction(["edit:voucher"])}
      canDelete={canPerformAction(["delete:voucher"])}
      data={row.original}
    />
  );
};

export const columns: ColumnDef<VoucherColumn>[] = [
  {
    accessorKey: "code",
    header: "Code",
  },
  {
    accessorKey: "discountType",
    header: "Discount Type",
    cell: ({ row }) => {
      return (
        <Badge
          variant={
            row.original.discountType === VoucherDiscountType.PERCENT
              ? "outline"
              : "secondary"
          }
        >
          {row.original.discountType}
        </Badge>
      );
    },
  },
  {
    accessorKey: "discountValue",
    header: "Discount Value",
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
    accessorKey: "usageLimit",
    header: "Usage Limit",
  },
  {
    accessorKey: "perUserLimit",
    header: "Per User Limit",
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
