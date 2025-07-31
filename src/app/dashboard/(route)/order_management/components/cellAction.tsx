"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Copy, Eye, MoreHorizontal } from "lucide-react";
import React from "react";
import { OrderManagementColumn } from "./column";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import axios from "axios";

type CellActionProps = {
  data: OrderManagementColumn;
  editPayment: boolean;
  editOrderStatus: boolean;
};
export default function CellAction({
  data,
  editPayment,
  editOrderStatus,
}: CellActionProps) {
  const router = useRouter();
  const onCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success("Order id copied");
  };
  const EditPayment = async () => {
    try {
      await axios.patch(`/api/order/${data.id}`, {
        ...data,
        paymentStatus: true,
      });
      toast.success(`Order #${data.displayId} placed as Paid`);
      router.refresh();
      router.refresh();
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong!");
    }
  };
  const EditOrderStatus = async () => {
    try {
      await axios.patch(`/api/order/${data.id}`, {
        orderStatus: "Completed",
        paymentStatus: true,
      });
      toast.success(`Order #${data.displayId} placed as Completed and Paid`);
      router.refresh();
      router.refresh();
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong!");
    }
  };
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={"ghost"} className="w-8 h-8">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => onCopy(data.id)}>
            <Copy className="w-4 h-4" />
            Copy Id
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push(`/dashboard/order/${data.id}`)}
          >
            <Eye className="w-4 h-4" />
            Reciept
          </DropdownMenuItem>
          {editPayment && (
            <DropdownMenuItem onClick={EditPayment}>
              Set as Paid
            </DropdownMenuItem>
          )}
          {editOrderStatus && (
            <DropdownMenuItem onClick={EditOrderStatus}>
              Set as Completed and Paid
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
