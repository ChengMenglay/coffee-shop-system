import {
  Archive,
  ChevronRight,
  ClipboardList,
  Home,
  Inbox,
  Package,
  PackageOpen,
  Puzzle,
  ShieldCheck,
  ShoppingCart,
  UserCircle,
  UtensilsCrossed,
  Building2,
  Bell,
  ReceiptText,
  Tags,
  StretchHorizontal,
  Candy,
  Snowflake,
  Zap,
  Tag,
  PersonStanding,
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
import NotificationBell from "./NotificaitonBell"; // fix spelling if needed
import { Notification } from "types";
import { formatDistanceStrict } from "date-fns";
import { getUserId } from "@/app/(auth)/actions/authAction";
import AutoRefresh from "./AutoRefresh";
import { prisma } from "@/lib/prisma";

const menuGroups = (counts: {
  purchase: number;
  stock: number;
  order_management: number;
}) => [
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
    title: "Sale & Order",
    items: [
      {
        title: "Point of Sale",
        url: "/dashboard/order",
        icon: ReceiptText,
        requiredPermission: "view:order",
      },
      {
        title: "Order Management",
        url: "/dashboard/order_management",
        icon: Bell,
        requiredPermission: "view:order_management",
        count: counts.order_management,
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
];

const userManagementItems = [
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
];

const productItems = [
  {
    title: "Products",
    url: "/dashboard/product",
    icon: Package,
    requiredPermission: "view:product",
  },
  {
    title: "Category",
    url: "/dashboard/category",
    icon: Tags,
    requiredPermission: "view:category",
  },
  {
    title: "Size",
    url: "/dashboard/size",
    icon: StretchHorizontal,
    requiredPermission: "view:size",
  },
  {
    title: "Sugar",
    url: "/dashboard/sugar",
    icon: Candy, // changed here
    requiredPermission: "view:sugar",
  },
  {
    title: "Ice",
    url: "/dashboard/ice",
    icon: Snowflake, // changed here
    requiredPermission: "view:ice",
  },
  {
    title: "Extra Shot",
    url: "/dashboard/extra-shot",
    icon: Zap, // changed here
    requiredPermission: "view:extra-shot",
  },
];

export async function AppSidebar() {
  const session = await auth();
  const users = session?.user;
  const userId = await getUserId();
  const [
    purchaseCount,
    stockCount,
    notifications,
    orderPendingCount,
    orderDraftCount,
  ] = await Promise.all([
    prisma.pendingPurchase.count({ where: { approvalStatus: "Pending" } }),
    prisma.pendingStockUsage.count({ where: { approvalStatus: "Pending" } }),
    prisma.notification.findMany({
      where: { userId: userId as string },
      include: { user: { include: { role: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.count({ where: { orderStatus: "Pending" } }),
    prisma.order.count({ where: { orderStatus: "Draft" } }),
  ]);
  const totalOrder = orderPendingCount + orderDraftCount;
  const groups = menuGroups({
    purchase: purchaseCount,
    stock: stockCount,
    order_management: totalOrder,
  });

  // Optional: format notifications if needed for NotificaitonBell
  const formattedNotifications: Notification[] = notifications.map((item) => ({
    id: item.id,
    name: item.user.name,
    role: item.user.role.name,
    title: item.title,
    message: item.message,
    type: item.type,
    read: item.read,
    createdAt: formatDistanceStrict(new Date(item.createdAt), new Date(), {
      addSuffix: true,
    }),
  }));

  return (
    <Sidebar className="py-2">
      <AutoRefresh interval={20000} />
      <SidebarContent>
        <SidebarGroup className="gap-y-4">
          <SidebarGroupLabel className="flex items-center justify-between sticky top-0  z-10">
            <Link href="/" className="font-bold text-black text-2xl">
              Coffee Shop
            </Link>
            <NotificationBell
              userId={userId as string}
              mockNotifications={formattedNotifications}
            />
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="px-2 space-y-1">
              {groups.map((group) => (
                <div key={group.title} className="mb-2">
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
              {/* Products Dropdown */}
              <SidebarMenuItem>
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="h-12 flex justify-between items-center hover:bg-gray-100 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Tag className="w-5 h-5 text-gray-600" />
                        <span className="font-medium text-gray-700">
                          Product Management
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-500 transition-transform duration-200" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="ml-4 mt-1">
                    <SidebarMenuSub>
                      {productItems
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

              {/* User Management Dropdown */}
              <SidebarMenuItem>
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="h-12 flex justify-between items-center hover:bg-gray-100 rounded-lg">
                      <div className="flex items-center gap-3">
                        <PersonStanding className="w-5 h-5 text-gray-600" />
                        <span className="font-medium text-gray-700">
                          User Management
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-500 transition-transform duration-200" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="ml-4 mt-1">
                    <SidebarMenuSub>
                      {userManagementItems
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
              <div className="border-t border-gray-200 my-2" />

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
