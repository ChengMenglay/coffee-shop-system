"use client";
import React from "react";
import { Button } from "./ui/button";
import { LogoutUser } from "@/app/(auth)/actions/authAction";
import { LogOutIcon } from "lucide-react";
import { SidebarMenuButton } from "./ui/sidebar";

function Singout() {
  return (
    <SidebarMenuButton
      className=" h-14"
      onClick={async () => await LogoutUser()}
    >
      <LogOutIcon style={{ width: "20px", height: "20px" }} />
      <span className="font-medium text-lg">Logout</span>
    </SidebarMenuButton>
  );
}

export default Singout;
