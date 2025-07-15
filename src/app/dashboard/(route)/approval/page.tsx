import { checkPermission } from "@/lib/check-permission";
import React from "react";

export default async function Approval() {
  await checkPermission(["view:approval"]);
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 px-6 py-8">Approval Page</div>
    </div>
  );
}
