"use client";
import React, { useState } from "react";
import { LogoutUser } from "@/app/(auth)/actions/authAction";
import { LogOut, LogOutIcon, Trash } from "lucide-react";
import { SidebarMenuButton } from "./ui/sidebar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";

function Singout() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <SidebarMenuButton
        onClick={() => setIsOpen(true)}
        className="h-12 flex justify-between items-center hover:bg-red-50 rounded-lg text-red-600"
      >
        <div className="flex items-center gap-3 cursor-pointer">
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
        </div>
      </SidebarMenuButton>
      <AlertDialog open={isOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently singout you
              account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button onClick={() => setIsOpen(false)} variant="outline">
                Cancel
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                variant={"ghost"}
                onClick={async () => await LogoutUser()}
              >
                <LogOutIcon className="w-4 h-4" />
                Logout
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default Singout;
