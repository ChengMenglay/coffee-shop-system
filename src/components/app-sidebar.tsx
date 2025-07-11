import { ClipboardList, Home, PackageOpen, UserCircle } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { UtensilsCrossed } from "lucide-react";
import Link from "next/link";
import { auth } from "@/auth";
import Singout from "./Singout";
const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Ingredient",
    url: "/dashboard/ingredient",
    icon: UtensilsCrossed,
  },
  { title: "Stock Usage", url: "/dashboard/stock-usage", icon: PackageOpen },
  { title: "Purchases", url: "/dashboard/purchase", icon: ClipboardList },
  {
    title: "Account",
    url: "/dashboard/account",
    icon: UserCircle,
  },
];

export async function AppSidebar() {
  const session = await auth();
  const users = session?.user;
  return (
    <Sidebar className="py-2">
      <SidebarContent>
        <SidebarGroup className="gap-y-4 ">
          <SidebarGroupLabel>
            <Link href="/" className="font-bold text-black text-2xl">
              Coffee Shop
            </Link>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="px-2">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-14">
                    <a href={item.url}>
                      <item.icon style={{ width: "20px", height: "20px" }} />
                      <span className="font-medium text-lg">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <Singout />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
