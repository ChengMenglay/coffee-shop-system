"use client";
import { ColumnDef } from "@tanstack/react-table";
import CellAction from "./cell-action";
import { Badge } from "@/components/ui/badge";

export type RoleColumn = {
  id: string;
  name: string;
  permissions: string[];
};

export const columns: ColumnDef<RoleColumn>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "permission",
    header: "Permissions",
    cell: ({ row }) => {
      const permissions: string[] = row.original.permissions;
      const visible = permissions.slice(0, 4); //Display first 3 permissions
      const hidden = permissions.length - visible.length;
      return (
        <div className="flex  flex-wrap gap-1 max-w-[200px] ">
          {visible.map((permission, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {permission}
            </Badge>
          ))}
          {hidden > 0 && (
            <span className="text-sm text-muted-foreground">
              +{hidden} more
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "Action",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
