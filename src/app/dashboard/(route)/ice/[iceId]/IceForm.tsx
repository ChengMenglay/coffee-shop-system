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
import { Ice, Product } from "types";

type IceFormProps = {
  initialData: Ice | null;
  products: Product[] | null;
};

// Define error response type
interface ErrorResponse {
  message?: string;
  error?: string;
}

const iceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  productId: z.string().min(1, "Product id is required"),
});

type IceSchema = z.infer<typeof iceSchema>;

function IceForm({ initialData, products }: IceFormProps) {
  const title = initialData ? "Update Ice" : "Create Ice";
  const subtitle = initialData ? "Edit a ice" : "Add a new ice";
  const toastMessage = initialData ? "Ice updated." : "Ice created";
  const router = useRouter();
  const form = useForm<IceSchema>({
    resolver: zodResolver(iceSchema),
    defaultValues: initialData
      ? { ...initialData }
      : {
          name: "",
          productId: "",
        },
  });
  const [isLoading, setIsLoading] = useState(false);

  const onSubmitted = async (data: IceSchema) => {
    try {
      setIsLoading(true);
      if (initialData) {
        await axios.patch(`/api/ice/${initialData.id}`, data);
      } else {
        await axios.post("/api/ice", data);
      }
      toast.success(toastMessage);
      router.push("/dashboard/ice");
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
                        <SelectValue placeholder={"Select a ice"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="No Ice">No Ice</SelectItem>
                          <SelectItem value="Less Ice">Less Ice</SelectItem>
                          <SelectItem value="Normal Ice">Normal Ice</SelectItem>
                          <SelectItem value="More Ice">More Ice</SelectItem>
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

export default IceForm;
