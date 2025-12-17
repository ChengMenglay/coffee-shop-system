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
import { ChevronLeft } from "lucide-react";
import { Category } from "@prisma/client";
import ImageUpload from "@/components/image-upload";

type CategoryFormProps = {
  initialData: Category | null;
};
const categorySchema = z.object({
  name: z.string().min(1, "Category is required"),
  image: z.string().optional(),
});
type CategorySchema = z.infer<typeof categorySchema>;
function CategoryForm({ initialData }: CategoryFormProps) {
  const title = initialData ? "Update Category" : "Create Category";
  const subtitle = initialData ? "Edit an category" : "Add a new category";
  const toastMessage = initialData ? "Category updated." : "Category created";
  const router = useRouter();
  const form = useForm<CategorySchema>({
    resolver: zodResolver(categorySchema),
    defaultValues: initialData
      ? { ...initialData, image: initialData.image || "" }
      : {
          name: "",
          image: "",
        },
  });
  const [isLoading, setIsLoading] = useState(false);
  const onSubmitted = async (data: CategorySchema) => {
    try {
      setIsLoading(true);
      if (initialData) {
        await axios.patch(`/api/category/${initialData.id}`, data);
      } else {
        await axios.post("/api/category", data);
      }
      toast.success(toastMessage);
      router.push("/dashboard/category");
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
                      placeholder="Category name..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
                        <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image</FormLabel>
                  <FormControl>
                    <ImageUpload
                    disable={isLoading}
                      value={field.value ? field.value : ""}
                      onChange={(url: string) => field.onChange(url)}
                      onDelete={() => field.onChange("")}
                    />
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

export default CategoryForm;
