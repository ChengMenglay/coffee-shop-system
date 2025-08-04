"use client";

import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  Form,
  FormMessage,
} from "@/components/ui/form";
import z from "zod";
import { useState } from "react";
import { CgSpinnerTwoAlt } from "react-icons/cg";
import { toast } from "sonner";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Permission, Role } from "@/generated/prisma";
import { ChevronLeft } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

type SupplierFormProps = {
  initialData: (Role & { permissions: Permission[] }) | null;
  permissions: Permission[];
};
const roleSchema = z.object({
  name: z.string().min(1, "Name is required"),
  permissions: z.array(z.string()),
});
type RoleSchema = z.infer<typeof roleSchema>;
function RoleForm({ initialData, permissions }: SupplierFormProps) {
  const title = initialData ? "Update Role" : "Create Role";
  const subtitle = initialData ? "Edit an Role" : "Add a new Role";
  const toastMessage = initialData ? "Role updated." : "Role created";
  const router = useRouter();
  const form = useForm<RoleSchema>({
    resolver: zodResolver(roleSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          permissions: initialData.permissions.map((item) => item.id),
        }
      : {
          name: "",
          permissions: [],
        },
  });
  const [isLoading, setIsLoading] = useState(false);
  const onSubmitted = async (data: RoleSchema) => {
    try {
      setIsLoading(true);
      if (initialData) {
        await axios.patch(`/api/role/${initialData.id}`, data);
      } else {
        await axios.post("/api/role", data);
      }
      toast.success(toastMessage);
      router.push("/dashboard/role");
      router.refresh();
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong!");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <>
      <div className="flex overflow-y-auto items-center justify-between">
        <div className="flex space-x-6">
          <Button
            onClick={() => router.back()}
            variant={"outline"}
            size={"icon"}
          >
            <ChevronLeft />
          </Button>
          <Header title={title} subtitle={subtitle} />
        </div>
      </div>
      <Separator />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmitted)} className="space-y-4">
          <div className="grid grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      placeholder="Role name..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="permissions"
              render={({ field }) => {
                const grouped = permissions.reduce(
                  (acc: Record<string, Permission[]>, perm) => {
                    const [_action, module] = perm.key.split(":");
                    if (!_action || !module) {
                      return acc;
                    }
                    if (!acc[module]) acc[module] = [];
                    acc[module].push(perm);
                    return acc;
                  },
                  {}
                );

                const groupEntries = Object.entries(grouped);

                return (
                  <FormItem className="col-span-3">
                    <FormLabel>Permissions</FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {groupEntries.map(([module, modulePermissions]) => (
                          <div key={module}>
                            <h4 className="text-primary font-semibold capitalize mb-2">
                              {module}
                            </h4>
                            <div className="space-y-1">
                              {modulePermissions
                                .sort((a, b) => a.key.localeCompare(b.key)) // optional sorting by key
                                .map((perm) => (
                                  <div
                                    className="flex items-center space-x-2"
                                    key={perm.id}
                                  >
                                    <Checkbox
                                      id={`permission-${perm.id}`}
                                      checked={field.value.includes(perm.id)}
                                      onCheckedChange={(checked) => {
                                        const updated = checked
                                          ? [...field.value, perm.id]
                                          : field.value.filter(
                                              (id) => id !== perm.id
                                            );
                                        field.onChange(updated);
                                      }}
                                    />
                                    <Label
                                      htmlFor={`permission-${perm.id}`}
                                      className="text-sm capitalize"
                                    >
                                      {perm.name}
                                    </Label>
                                  </div>
                                ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          </div>

          <Button disabled={isLoading} type="submit">
            {isLoading && <CgSpinnerTwoAlt className=" animate-spin" />}
            {isLoading
              ? initialData
                ? "Save Change..."
                : "Creating..."
              : initialData
              ? "Save Change"
              : "Create"}
          </Button>
        </form>
      </Form>
    </>
  );
}

export default RoleForm;
