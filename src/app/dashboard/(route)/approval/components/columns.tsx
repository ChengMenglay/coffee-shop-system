"use client";
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";

export type PurchaseColumn = {
  id: string;
  ingredient: string;
  requestedBy: string;
  approvalStatus: string;
  note: string;
  approvedBy: string;
  rejectionReason: string;
  approvedAt: string;
  createdAt: string;
};

export const PurchaseColumns: ColumnDef<PurchaseColumn>[] = [
  {
    accessorKey: "ingredient",
    header: "Ingredient",
  },
  { accessorKey: "requestedBy", header: "Requested By" },
  {
    accessorKey: "approvalStatus",
    header: "Approve Status",
    cell: ({ row }) => {
      const status = row.original.approvalStatus;
      let colorClass = "bg-blue-100 text-blue-800 border border-blue-300";
      let label = "Pending";
      if (status === "Approved") {
        colorClass = "bg-green-100 text-green-800 border border-green-300";
        label = "Approved";
      } else if (status === "Rejected") {
        colorClass = "bg-red-100 text-red-800 border border-red-300";
        label = "Rejected";
      }
      return (
        <Badge className={`text-xs px-2 py-1 rounded ${colorClass}`}>
          {label}
        </Badge>
      );
    },
  },
  { accessorKey: "approvedBy", header: "Approved By" },
  { accessorKey: "rejectionReason", header: "Rejection Reason" },
  { accessorKey: "approvedAt", header: "Approved At" },
  { accessorKey: "note", header: "Note" },
  { accessorKey: "createdAt", header: "Created At" },
];

export type StockUsageColumn = {
  id: string;
  ingredient: string;
  requestedBy: string;
  status: string;
  approvalStatus: string;
  note: string;
  approvedBy: string;
  rejectionReason: string;
  approvedAt: string;
  createdAt: string;
};

export const StockUsageColumns: ColumnDef<StockUsageColumn>[] = [
  {
    accessorKey: "ingredient",
    header: "Ingredient",
  },
  { accessorKey: "requestedBy", header: "Requested By" },
  { accessorKey: "status", header: "Status" },
  {
    accessorKey: "approvalStatus",
    header: "Approval Status",
    cell: ({ row }) => {
      const status = row.original.approvalStatus;

      const statusMap: Record<string, { label: string; className: string }> = {
        Approved: {
          label: "Approved",
          className: "bg-green-100 text-green-800 border border-green-300",
        },
        Rejected: {
          label: "Rejected",
          className: "bg-red-100 text-red-800 border border-red-300",
        },
      };

      const statusData = statusMap[status];

      if (!statusData) return null; // If not Approved or Rejected, show nothing

      return (
        <Badge className={`text-xs px-2 py-1 rounded ${statusData.className}`}>
          {statusData.label}
        </Badge>
      );
    },
  },

  { accessorKey: "approvedBy", header: "Approved By" },
  { accessorKey: "rejectionReason", header: "Rejection Reason" },
  { accessorKey: "approvedAt", header: "Approved At" },
  { accessorKey: "note", header: "Note" },
  { accessorKey: "createdAt", header: "Created At" },
];
