import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import CellAction from "./cellAction";
import { usePermissions } from "@/hooks/usePermission";

export type OrderManagementColumn = {
  id: string;
  userId: string;
  displayId: string;
  user: string;
  product: string;
  orderStatus: string;
  paymentStatus: boolean;
  paymentMethod: string;
  total: string;
  createdAt: string;
};

const ActionCell = ({ row }: { row: { original: OrderManagementColumn } }) => {
  const { canPerformAction } = usePermissions();

  return (
      <CellAction
        editOrderStatusCompleted={row.original.orderStatus === "Completed"}
        editOrderStatusCancelled={row.original.orderStatus === "Cancelled"}
        editPaymentPaid={!row.original.paymentStatus}
        editPaymentUnPaid={row.original.paymentStatus}
        data={row.original}
        canDelete={canPerformAction(["delete:order_management"])}
      />
  );
};

export const columns: ColumnDef<OrderManagementColumn>[] = [
  {
    accessorKey: "displayId",
    header: "Order Id",
  },
  {
    accessorKey: "product",
    header: "Product Name",
  },
  {
    accessorKey: "user",
    header: "User",
  },
  {
    accessorKey: "orderStatus",
    header: "Order Status",
    cell: ({ row }) => {
      const originalData = row.original;
      return (
        <Badge
          className={
            originalData.orderStatus === "Completed"
              ? "bg-green-100 text-green-800 border border-green-300"
              : originalData.orderStatus === "Pending"
              ? "bg-blue-100 text-blue-800 border border-blue-300"
              : "bg-red-100 text-red-800 border border-red-300"
          }
        >
          {originalData.orderStatus}
        </Badge>
      );
    },
  },
  {
    accessorKey: "paymentStatus",
    header: "Payment Status",
    cell: ({ row }) => (
      <Badge
        className={
          row.original.paymentStatus
            ? "bg-green-100 text-green-800 border border-green-300"
            : "bg-red-100 text-red-800 border border-red-300"
        }
      >
        {row.original.paymentStatus ? "Paid" : "UnPaid"}
      </Badge>
    ),
  },
  {
    accessorKey: "paymentMethod",
    header: "Payment Method",
  },
  {
    accessorKey: "total",
    header: "Total",
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => <ActionCell row={row} />
  },
];
