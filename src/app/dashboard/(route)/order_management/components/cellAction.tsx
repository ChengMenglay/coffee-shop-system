"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Copy, Eye, MoreHorizontal, Trash } from "lucide-react";
import React, { useState } from "react";
import { OrderManagementColumn } from "./column";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import axios from "axios";

type CellActionProps = {
  data: OrderManagementColumn;
  editPaymentPaid: boolean;
  editPaymentUnPaid: boolean;
  editOrderStatusCompleted: boolean;
  editOrderStatusCancelled: boolean;
  canDelete: boolean;
};
export default function CellAction({
  data,
  editPaymentPaid,
  editPaymentUnPaid,
  editOrderStatusCompleted,
  editOrderStatusCancelled,
  canDelete,
}: CellActionProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const onCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success("Order id copied");
  };
  const EditPaymentPaid = async () => {
    try {
      await axios.patch(`/api/order/${data.id}`, {
        ...data,
        paymentStatus: true,
      });
      toast.success(`Order #${data.displayId} placed as Paid`);
      router.refresh();
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong!");
    }
  };
  const EditPaymentUnPaid = async () => {
    try {
      await axios.patch(`/api/order/${data.id}`, {
        ...data,
        paymentStatus: false,
      });
      toast.success(`Order #${data.displayId} placed as UnPaid`);
      router.refresh();
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong!");
    }
  };
  const EditOrderStatusCancelled = async () => {
    try {
      await axios.patch(`/api/order/${data.id}`, {
        orderStatus: "Cancelled",
        paymentStatus: false,
      });
      toast.success(`Order #${data.displayId} placed as Cancelled and UnPaid`);
      router.refresh();
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong!");
    }
  };
  const EditOrderStatusCompleted = async () => {
    try {
      await axios.patch(`/api/order/${data.id}`, {
        orderStatus: "Completed",
        paymentStatus: true,
      });
      toast.success(`Order #${data.displayId} placed as Completed and Paid`);
      router.refresh();
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong!");
    }
  };
  const onDelete = async () => {
    try {
      await axios.delete(`/api/order/${data.id}`);
      toast.success(`Order #${data.displayId} deleted`);
      router.refresh();
      setIsOpen(false);
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong!");
    }
  };
  return (
    <>
      <AlertDialog open={isOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              row and remove your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button onClick={() => setIsOpen(false)} variant="outline">
                Cancel
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button variant={"ghost"} onClick={onDelete}>
                <Trash className="w-4 h-4" />
                Delete
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
          {canDelete && (
            <DropdownMenuItem onClick={() => setIsOpen(true)}>
              Delete
            </DropdownMenuItem>
          )}
          {editPaymentPaid && (
            <DropdownMenuItem onClick={EditPaymentPaid}>
              Set as Paid
            </DropdownMenuItem>
          )}
          {editPaymentUnPaid && (
            <DropdownMenuItem onClick={EditPaymentUnPaid}>
              Set as UnPaid
            </DropdownMenuItem>
          )}
          {editOrderStatusCancelled && (
            <DropdownMenuItem onClick={EditOrderStatusCompleted}>
              Set as Completed and Paid
            </DropdownMenuItem>
          )}
          {editOrderStatusCompleted && (
            <DropdownMenuItem onClick={EditOrderStatusCancelled}>
              Set as Cancelled and UnPaid
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
