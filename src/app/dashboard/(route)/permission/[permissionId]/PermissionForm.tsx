"use client";

import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Permission } from "@/generated/prisma";
import { ChevronLeft } from "lucide-react";

type PermissionFormProps = {
  initialData: Permission | null;
};
const permissionSchema = z.object({
  name: z.string().min(1, "Permission is required"),
  key: z.string().min(1, "Key is required"),
});
type PermissionSchema = z.infer<typeof permissionSchema>;
function PermissionForm({ initialData }: PermissionFormProps) {
  const title = initialData ? "Update Permission" : "Create Permission";
  const subtitle = initialData ? "Edit an Permission" : "Add a new Permission";
  const toastMessage = initialData
    ? "Permission updated."
    : "Permission created";
  const router = useRouter();
  const form = useForm<PermissionSchema>({
    resolver: zodResolver(permissionSchema),
    defaultValues: initialData
      ? { ...initialData }
      : {
          name: "",
          key: "",
        },
  });
  const [isLoading, setIsLoading] = useState(false);
  const onSubmitted = async (data: PermissionSchema) => {
    try {
      setIsLoading(true);
      if (initialData) {
        await axios.patch(`/api/permission/${initialData.id}`, data);
      } else {
        await axios.post("/api/permission", data);
      }
      toast.success(toastMessage);
      router.push("/dashboard/permission");
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
          <div className="grid grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      placeholder="Permission name..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Key</FormLabel>
                  <FormControl>
                    <Input disabled={isLoading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
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

export default PermissionForm;
