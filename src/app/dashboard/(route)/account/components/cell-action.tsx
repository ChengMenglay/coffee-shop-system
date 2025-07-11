"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, CheckCircle } from "lucide-react";
import React, { useState } from "react";
import { OrderColumn } from "./columns";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

type CellActionProps = {
  data: OrderColumn;
  status1: string;
  status2: string;
};

export default function CellAction({
  data,
  status1,
  status2,
}: CellActionProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Combined update function for both status and payment
  const updateOrder = async (updates: {
    status?: string;
    isPaid?: boolean;
  }) => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const response = await axios.put("/api/order", {
        orderId: data.id,
        ...updates,
      });

      if (response.status === 200) {
        // Create appropriate success message based on what was updated
        let message = "";
        if (updates.status) {
          message = `Order status updated to ${updates.status}`;
        } else if (updates.isPaid !== undefined) {
          message = updates.isPaid
            ? "Order marked as paid"
            : "Order marked as unpaid";
        }

        toast.success(message);
        router.refresh();
      }
    } catch (error) {
      toast.error("Failed to update order");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={"ghost"} className="w-8 h-8" disabled={isLoading}>
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Order Actions</DropdownMenuLabel>

          {/* Status section */}
          <DropdownMenuLabel className="text-xs text-muted-foreground mt-2">
            Current Status: <span className="font-bold">{data.status}</span>
          </DropdownMenuLabel>

          <DropdownMenuItem
            onClick={() => updateOrder({ status: status1 })}
            disabled={data.status === status1 || isLoading}
            className="flex items-center justify-between"
          >
            <span>Update to {status1}</span>
            {data.status === status1 && (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => updateOrder({ status: status2 })}
            disabled={data.status === status2 || isLoading}
            className="flex items-center justify-between"
          >
            <span>Update to {status2}</span>
            {data.status === status2 && (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Payment section */}
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Payment Status:{" "}
            <span className="font-bold">{data.isPaid ? "Paid" : "Unpaid"}</span>
          </DropdownMenuLabel>

          <DropdownMenuItem
            onClick={() => {
              if (
                window.confirm(
                  "Are you sure you want to mark this order as paid?"
                )
              ) {
                updateOrder({ isPaid: true });
              }
            }}
            disabled={data.isPaid || isLoading}
            className="flex items-center justify-between"
          >
            <span>Mark as Paid</span>
            {data.isPaid && <CheckCircle className="h-4 w-4 text-green-500" />}
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => {
              if (
                window.confirm(
                  "Are you sure you want to mark this order as unpaid?"
                )
              ) {
                updateOrder({ isPaid: false });
              }
            }}
            disabled={!data.isPaid || isLoading}
            className="flex items-center justify-between"
          >
            <span>Mark as Unpaid</span>
            {!data.isPaid && <CheckCircle className="h-4 w-4 text-green-500" />}
          </DropdownMenuItem>

          {/* Combined actions section */}
          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => {
              if (
                window.confirm(
                  "Are you sure you want to complete this order and mark it as paid?"
                )
              ) {
                updateOrder({ status: "Completed", isPaid: true });
              }
            }}
            disabled={(data.status === "Completed" && data.isPaid) || isLoading}
            className="bg-green-50 hover:bg-green-100"
          >
            Complete Order & Mark as Paid
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => {
              if (
                window.confirm(
                  "Are you sure you want to pending this order and mark it as pending?"
                )
              ) {
                updateOrder({ status: "Pending", isPaid: false });
              }
            }}
            disabled={(data.status === "Pending" && !data.isPaid) || isLoading}
            className="bg-green-50 hover:bg-green-100"
          >
            Pending Order & Mark as Pending
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => {
              if (
                window.confirm("Are you sure you want to cancel this order?")
              ) {
                updateOrder({ status: "Canceled", isPaid: false });
              }
            }}
            disabled={data.status === "Canceled" || isLoading}
            className="bg-red-50 hover:bg-red-100 text-red-600"
          >
            Cancel Order
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
