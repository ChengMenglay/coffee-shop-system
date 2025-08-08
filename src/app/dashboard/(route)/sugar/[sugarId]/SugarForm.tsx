"use client";

import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Product, Sugar } from "types";

type SugarFormProps = {
  initialData: Sugar | null;
  products: Product[] | null;
};

// Define error response type
interface ErrorResponse {
  message?: string;
  error?: string;
}

const sugarSchema = z.object({
  name: z.string().min(1, "Name is required"),
  productId: z.string().min(1, "Product id is required"),
});

type SugarSchema = z.infer<typeof sugarSchema>;

function SugarForm({ initialData, products }: SugarFormProps) {
  const title = initialData ? "Update Sugar" : "Create Sugar";
  const subtitle = initialData ? "Edit a sugar" : "Add a new sugar";
  const toastMessage = initialData ? "Sugar updated." : "Sugar created";
  const router = useRouter();
  const form = useForm<SugarSchema>({
    resolver: zodResolver(sugarSchema),
    defaultValues: initialData
      ? { ...initialData }
      : {
          name: "",
          productId: "",
        },
  });
  const [isLoading, setIsLoading] = useState(false);

  const onSubmitted = async (data: SugarSchema) => {
    try {
      setIsLoading(true);
      if (initialData) {
        await axios.patch(`/api/sugar/${initialData.id}`, data);
      } else {
        await axios.post("/api/sugar", data);
      }
      toast.success(toastMessage);
      router.push("/dashboard/sugar");
      router.refresh();
    } catch (error) {
      console.log(error);

      // Type-safe error handling
      let errorMessage = "Something went wrong. Please try again.";

      if (error instanceof AxiosError) {
        // Handle Axios errors
        const responseData = error.response?.data as ErrorResponse;
        errorMessage =
          responseData?.message || responseData?.error || error.message;
      } else if (error instanceof Error) {
        // Handle regular errors
        errorMessage = error.message;
      }

      toast.error(errorMessage);
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
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={"Select a sugar"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="No Sweet">No Sweet</SelectItem>
                          <SelectItem value="Less Sweet">Less Sweet</SelectItem>
                          <SelectItem value="Normal Sweet">
                            Normal Sweet
                          </SelectItem>
                          <SelectItem value="More Sweet">More Sweet</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="productId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={"Select a product"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {products?.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
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

export default SugarForm;
