"use client";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { LogOut, User } from "lucide-react";
import { LogoutUser } from "@/app/(auth)/actions/authAction";
type UserMenuTypeProps = {
  role: string;
  name: string;
};
function UserMenu({ name, role }: UserMenuTypeProps) {
  const router = useRouter();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src="/images/user.png" alt="User" />
            <AvatarFallback>
              {name
                ? name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                : "U"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 p-2 rounded-lg shadow-md bg-white z-[1000]">
        <DropdownMenuLabel className="p-2 font-semibold text-lg">
          My Account
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="px-2 py-2 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">Name:</span>
            <span className="text-sm font-medium truncate">{name}</span>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {role !== "Tablet" && (
            <DropdownMenuItem
              className="cursor-pointer p-2 rounded-md hover:bg-slate-100 duration-200 flex items-center focus:outline-none focus:bg-slate-100"
              onClick={() => router.push(`/dashboard/order`)}
            >
              <User className="mr-2 h-4 w-4" />
              Admin Dashboard
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={async () => await LogoutUser()}
            className="cursor-pointer p-2 rounded-md hover:bg-slate-100 duration-200 flex items-center focus:outline-none focus:bg-slate-100"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default UserMenu;
