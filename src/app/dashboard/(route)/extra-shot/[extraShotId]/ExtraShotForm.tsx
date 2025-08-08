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
import { ExtraShot, Product } from "types";
import { Input } from "@/components/ui/input";

type ExtraShotFormProps = {
  initialData: ExtraShot | null;
  products: Product[] | null;
};
interface ErrorResponse {
  message?: string;
  error?: string;
}
const extraShotSchema = z.object({
  name: z.string().min(1, "Name is required"),
  productId: z.string().min(1, "Product id is required"),
  priceModifier: z.coerce.number(),
});
type ExtraShotSchema = z.infer<typeof extraShotSchema>;
function ExtraShotForm({ initialData, products }: ExtraShotFormProps) {
  const title = initialData ? "Update Extra Shot" : "Create Extra Shot";
  const subtitle = initialData ? "Edit a extra shot" : "Add a new extra shot";
  const toastMessage = initialData
    ? "Extra Shot updated."
    : "Extra Shot created";
  const router = useRouter();
  const form = useForm<ExtraShotSchema>({
    resolver: zodResolver(extraShotSchema),
    defaultValues: initialData
      ? { ...initialData }
      : {
          name: "",
          productId: "",
          priceModifier: 0,
        },
  });
  const [isLoading, setIsLoading] = useState(false);
  const onSubmitted = async (data: ExtraShotSchema) => {
    try {
      setIsLoading(true);
      if (initialData) {
        await axios.patch(`/api/extra-shot/${initialData.id}`, data);
      } else {
        await axios.post("/api/extra-shot", data);
      }
      toast.success(toastMessage);
      router.push("/dashboard/extra-shot");
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
                        <SelectValue placeholder={"Select a coffee"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="less-coffee">
                            Less Coffee
                          </SelectItem>
                          <SelectItem value="extra-shot">Extra Shot</SelectItem>
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

export default ExtraShotForm;
