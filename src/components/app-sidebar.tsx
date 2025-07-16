import {
  Archive,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Home,
  Inbox,
  PackageOpen,
  Puzzle,
  Settings,
  ShieldCheck,
  ShoppingCart,
  UserCircle,
  UserCog,
  UtensilsCrossed,
  Building2,
  Bell,
  CreditCard,
  LogOut,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import Link from "next/link";
import { auth } from "@/auth";
import Singout from "./Singout";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { useState } from "react";

const menuGroups = async (counts: { purchase: number; stock: number }) => [
  {
    title: "Main",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: Home,
        requiredPermission: "view:dashboard",
      },
    ],
  },
  {
    title: "Inventory Management",
    items: [
      {
        title: "Ingredient",
        url: "/dashboard/ingredient",
        icon: UtensilsCrossed,
        requiredPermission: "view:ingredient",
      },
      {
        title: "Stock Usage",
        url: "/dashboard/stock-usage",
        icon: PackageOpen,
        requiredPermission: "view:stock",
      },
      {
        title: "Usage Request",
        url: "/dashboard/stock-usage-request",
        icon: Archive,
        requiredPermission: "view:stock-usage-request",
        count: counts.stock,
      },
    ],
  },
  {
    title: "Procurement",
    items: [
      {
        title: "Purchases",
        url: "/dashboard/purchase",
        icon: ClipboardList,
        requiredPermission: "view:purchases",
      },
      {
        title: "Purchase Request",
        url: "/dashboard/purchase-request",
        icon: ShoppingCart,
        requiredPermission: "view:purchase-request",
        count: counts.purchase,
      },
      {
        title: "Supplier",
        url: "/dashboard/supplier",
        icon: Building2,
        requiredPermission: "view:supplier",
      },
    ],
  },
  {
    title: "Approvals",
    items: [
      {
        title: "Approval History",
        url: "/dashboard/approval",
        icon: Inbox,
        requiredPermission: "view:approval",
      },
    ],
  },
  {
    title: "User Management",
    items: [
      {
        title: "Account",
        url: "/dashboard/account",
        icon: UserCircle,
        requiredPermission: "view:account",
      },
      {
        title: "Role",
        url: "/dashboard/role",
        icon: ShieldCheck,
        requiredPermission: "view:role",
      },
      {
        title: "Permission",
        url: "/dashboard/permission",
        icon: Puzzle,
        requiredPermission: "view:permission",
      },
    ],
  },
];

const settingsItems = [
  {
    title: "Profile Settings",
    url: "/dashboard/profile",
    icon: UserCog,
    requiredPermission: "view:profile",
  },
  {
    title: "Notifications",
    url: "/dashboard/notifications",
    icon: Bell,
    requiredPermission: "view:notifications",
  },
  {
    title: "Billing",
    url: "/dashboard/billing",
    icon: CreditCard,
    requiredPermission: "view:billing",
  },
];

export async function AppSidebar() {
  const session = await auth();
  const users = session?.user;

  const [purchaseCount, stockCount] = await Promise.all([
    prisma.pendingPurchase.count({ where: { approvalStatus: "Pending" } }),
    prisma.pendingStockUsage.count({ where: { approvalStatus: "Pending" } }),
  ]);

  const groups = await menuGroups({
    purchase: purchaseCount,
    stock: stockCount,
  });

  return (
    <Sidebar className="py-2">
      <SidebarContent>
        <SidebarGroup className="gap-y-4">
          <SidebarGroupLabel>
            <Link href="/" className="font-bold text-black text-2xl">
              Coffee Shop
            </Link>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="px-2 space-y-1">
              {groups.map((group) => (
                <div key={group.title} className="mb-4">
                  <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {group.title}
                  </div>
                  {group.items
                    .filter(
                      (item) =>
                        !item.requiredPermission ||
                        users?.permissions.includes(item.requiredPermission)
                    )
                    .map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          className="h-12 flex justify-between items-center hover:bg-gray-100 rounded-lg"
                        >
                          <a
                            href={item.url}
                            className="flex items-center gap-3 w-full"
                          >
                            <item.icon className="w-5 h-5 text-gray-600" />
                            <span className="font-medium text-gray-700 flex-1">
                              {item.title}
                            </span>
                            {typeof item.count === "number" &&
                              item.count > 0 && (
                                <Badge className="text-xs rounded-full bg-red-500 text-white">
                                  {item.count}
                                </Badge>
                              )}
                          </a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                </div>
              ))}

              {/* Settings Dropdown */}
              <SidebarMenuItem>
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="h-12 flex justify-between items-center hover:bg-gray-100 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Settings className="w-5 h-5 text-gray-600" />
                        <span className="font-medium text-gray-700">
                          Settings
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-500 transition-transform duration-200" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="ml-4 mt-1">
                    <SidebarMenuSub>
                      {settingsItems
                        .filter(
                          (item) =>
                            !item.requiredPermission ||
                            users?.permissions.includes(item.requiredPermission)
                        )
                        .map((item) => (
                          <SidebarMenuSubItem key={item.title}>
                            <SidebarMenuSubButton
                              asChild
                              className="h-10 hover:bg-gray-50 rounded-md"
                            >
                              <a
                                href={item.url}
                                className="flex items-center gap-3"
                              >
                                <item.icon className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-600">
                                  {item.title}
                                </span>
                              </a>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarMenuItem>

              {/* Divider */}
              <div className="border-t border-gray-200 my-2"></div>

              {/* Sign Out */}
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
