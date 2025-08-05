import {
  IconTrendingUp,
  IconReceipt,
  IconAlertTriangle,
  IconAlertTriangleFilled,
  IconDeviceTablet,
  IconTrendingDown,
} from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export interface DashboardStats {
  // Revenue Card
  todayRevenue: number;
  revenueChange: number; // percentage change from yesterday
  revenueTarget: number;
  isRevenueTargetMet: boolean;

  // Orders Card
  todayOrders: number;
  ordersChange: number; // change from yesterday
  peakHoursStart: string; // e.g., "9 AM"
  peakHoursEnd: string; // e.g., "11 AM"

  // Tablet Orders Card
  tabletOrders: number;
  counterOrders: number;
  tabletOrdersPercentage: number; // calculated: tabletOrders / totalOrders * 100

  // Low Stock Card
  lowStockItemsCount: number;
  lowStockItems: string[]; // array of item names like ["Milk", "Sugar", "Cups"]
}

export function SectionCards({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid lg:grid-cols-4 grid-cols-2 gap-4">
      {/* Daily Revenue */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>{"Today's Revenue"}</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            ${stats.todayRevenue.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {stats.revenueChange > 0 ? (
                <IconTrendingUp />
              ) : (
                <IconTrendingDown />
              )}
              {stats.revenueChange > 0 ? "+" : ""}
              {stats.revenueChange.toFixed(1)}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.revenueChange > 0 ? "Up" : "Down"} from yesterday{" "}
            {stats.revenueChange > 0 ? (
              <IconTrendingUp className="size-4" />
            ) : (
              <IconTrendingDown className="size-4" />
            )}
          </div>
          <div className="text-muted-foreground">
            Target: ${stats.revenueTarget.toLocaleString()}{" "}
            {stats.isRevenueTargetMet ? "✓" : "✗"}
          </div>
        </CardFooter>
      </Card>

      {/* Orders Count */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Orders Today</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.todayOrders}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {stats.ordersChange > 0 ? (
                <IconTrendingUp />
              ) : (
                <IconTrendingDown />
              )}
              {stats.ordersChange > 0 ? "+" : ""}
              {stats.ordersChange}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.ordersChange > 20 ? "Busy" : "Normal"} morning rush{" "}
            <IconReceipt className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Peak: {stats.peakHoursStart}-{stats.peakHoursEnd}
          </div>
        </CardFooter>
      </Card>

      {/* Tablet Orders */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Tablet Orders</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.tabletOrders}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconDeviceTablet />
              {stats.tabletOrdersPercentage.toFixed(0)}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.tabletOrdersPercentage > 50
              ? "Digital preferred"
              : "Counter preferred"}{" "}
            <IconDeviceTablet className="size-4" />
          </div>
          <div className="text-muted-foreground">
            vs {stats.counterOrders} counter orders
          </div>
        </CardFooter>
      </Card>

      {/* Low Stock Alert */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Low Stock Items</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.lowStockItemsCount}
          </CardTitle>
          <CardAction>
            <Badge
              variant={stats.lowStockItemsCount > 0 ? "destructive" : "outline"}
            >
              <IconAlertTriangle />
              {stats.lowStockItemsCount > 0 ? "Alert" : "Good"}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.lowStockItemsCount > 0 ? "Restock needed" : "All stocked"}{" "}
            <IconAlertTriangleFilled className="size-4" />
          </div>
          <div className="text-muted-foreground">
            {stats.lowStockItemsCount > 0
              ? stats.lowStockItems.join(", ")
              : "Inventory healthy"}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
