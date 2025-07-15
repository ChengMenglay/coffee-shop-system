import { checkPermission } from "@/lib/check-permission";
import React from "react";

async function DashboardPage() {
  await checkPermission(["view:dashboard"]);
  return <div className="px-4 py-8">DashboardPage</div>;
}

export default DashboardPage;
