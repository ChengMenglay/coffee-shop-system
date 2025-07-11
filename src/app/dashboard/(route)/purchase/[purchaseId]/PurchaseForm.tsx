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
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Ingredient, Purchase } from "@/generated/prisma";
import { ChevronLeft } from "lucide-react";

type PurchaseColumnPRops = {
  initialData: Purchase | null;
  ingredients: Ingredient[];
};
const purchaseSchema = z.object({
  ingredientId: z.string().min(1),
  price: z.coerce.number(),
  quantity: z.coerce.number(),
  supplier: z.string().min(1),
});
type PurchaseSchema = z.infer<typeof purchaseSchema>;
function PurchaseForm({ initialData, ingredients }: PurchaseColumnPRops) {
  const title = initialData ? "Update Purchase" : "Create Purchase";
  const subtitle = initialData ? "Edit an Purchase" : "Add a new Purchase";
  const toastMessage = initialData ? "Purchase updated." : "Purchase created";
  const router = useRouter();
  const form = useForm<PurchaseSchema>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: initialData
      ? { ...initialData, price: Number(initialData.price) }
      : {
          ingredientId: "",
          price: 0,
          quantity: 0,
          supplier: "",
        },
  });
  const [isLoading, setIsLoading] = useState(false);
  const onSubmitted = async (data: PurchaseSchema) => {
    try {
      setIsLoading(true);
      if (initialData) {
        await axios.patch(`/api/purchase/${initialData.id}`, data);
      } else {
        await axios.post("/api/purchase", data);
      }
      toast.success(toastMessage);
      router.push("/dashboard/purchase");
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
              name="ingredientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ingredient</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={"Select a ingredient"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {ingredients.map((item) => (
                            <SelectItem value={item.id}>{item.name}</SelectItem>
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
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input disabled={isLoading} type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price ($)</FormLabel>
                  <FormControl>
                    <Input disabled={isLoading} type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="supplier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supplier</FormLabel>
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

export default PurchaseForm;
