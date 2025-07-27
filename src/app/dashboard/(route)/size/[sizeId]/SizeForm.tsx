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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import axios from "axios";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Product, Size } from "types";

type SizeFormProps = {
  initialData: Size | null;
  products: Product[] | null;
};
const sizeSchema = z.object({
  sizeName: z.string().min(1, "Size is required"),
  priceModifier: z.coerce.number(),
  productId: z.string().min(1, "Product id is required"),
});
type SizeSchema = z.infer<typeof sizeSchema>;
function SizeForm({ initialData, products }: SizeFormProps) {
  const title = initialData ? "Update Size" : "Create Size";
  const subtitle = initialData ? "Edit an size" : "Add a new size";
  const toastMessage = initialData ? "Size updated." : "Size created";
  const router = useRouter();
  const form = useForm<SizeSchema>({
    resolver: zodResolver(sizeSchema),
    defaultValues: initialData
      ? { ...initialData }
      : {
          sizeName: "",
          priceModifier: 0,
          productId: "",
        },
  });
  const [isLoading, setIsLoading] = useState(false);
  const onSubmitted = async (data: SizeSchema) => {
    try {
      setIsLoading(true);
      if (initialData) {
        await axios.patch(`/api/size/${initialData.id}`, data);
      } else {
        await axios.post("/api/size", data);
      }
      toast.success(toastMessage);
      router.push("/dashboard/size");
      router.refresh();
    } catch (error: any) {
      console.log(error);
      toast.error(
        error?.response?.data || "Something went wrong. Please try again."
      );
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
              name="sizeName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Size</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={"Select a size"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="small">Small</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="large">Large</SelectItem>
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
                        <SelectValue placeholder={"Select a size"} />
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
            <FormField
              control={form.control}
              name="priceModifier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price Modifier</FormLabel>
                  <FormControl>
                    <Input disabled={isLoading} type="number" {...field} />
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

export default SizeForm;
