"use client";
import { ColumnDef } from "@tanstack/react-table";
import CellAction from "./cell-action";
import { Badge } from "@/components/ui/badge";
import { usePermissions } from "@/hooks/usePermission";

export type SupplierColumn = {
  id: string;
  name: string;
  contact: string;
  isActive: boolean;
  ingredients: string[];
};

export const columns: ColumnDef<SupplierColumn>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  { accessorKey: "contact", header: "Contact" },
  {
    accessorKey: "isActive",
    cell: ({ row }) =>
      row.original.isActive ? (
        <Badge
          variant="secondary"
          className="bg-blue-500 text-white dark:bg-blue-600"
        >
          Active
        </Badge>
      ) : (
        <Badge variant="destructive">Disable</Badge>
      ),
  },
  {
    accessorKey: "ingredients",
    header: "Ingredients",
    cell: ({ row }) => {
      const ingredients: string[] = row.original.ingredients;
      const visible = ingredients.slice(0, 3);
      const hidden = ingredients.length - visible.length;

      return (
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {visible.map((ingredient, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {ingredient}
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
      cell: ({ row }) => {
        const { canPerformAction } = usePermissions();
        return (
          <CellAction
            canEdit={canPerformAction(["edit:stock"])}
            canDelete={canPerformAction(["delete:stock"])}
            data={row.original}
          />
        );
      },
    },
];
