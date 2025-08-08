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
import { Ingredient } from "@prisma/client";
import { ChevronLeft } from "lucide-react";

type IngredientFormProps = {
  initialData: Ingredient | null;
};
const ingredientSchema = z.object({
  name: z.string().min(1, "Ingrediet is required"),
  stock: z.coerce.number(),
  unit: z.string().min(1, "Unit is required"),
  lowStockThreshold: z.coerce.number(),
});
type IngredientSchema = z.infer<typeof ingredientSchema>;
function IngredientForm({ initialData }: IngredientFormProps) {
  const title = initialData ? "Update Ingredient" : "Create Ingredient";
  const subtitle = initialData ? "Edit an ingredient" : "Add a new ingredient";
  const toastMessage = initialData
    ? "Ingredient updated."
    : "Ingredient created";
  const router = useRouter();
  const form = useForm<IngredientSchema>({
    resolver: zodResolver(ingredientSchema),
    defaultValues: initialData
      ? { ...initialData }
      : {
          name: "",
          stock: 0,
          unit: "",
          lowStockThreshold: 0,
        },
  });
  const [isLoading, setIsLoading] = useState(false);
  const onSubmitted = async (data: IngredientSchema) => {
    try {
      if (data.lowStockThreshold <= 0) {
        toast.warning("Low Stock must be greater than 0");
        return;
      }
      setIsLoading(true);
      if (initialData) {
        await axios.patch(`/api/ingredient/${initialData.id}`, data);
      } else {
        await axios.post("/api/ingredient", data);
      }
      toast.success(toastMessage);
      router.push("/dashboard/ingredient");
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
                  <FormLabel>Ingredient</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      placeholder="Ingredient name..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock</FormLabel>
                  <FormControl>
                    <Input disabled={isLoading} type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Weight & Volume</SelectLabel>
                          <SelectItem value="ml">Milliliters (ml)</SelectItem>
                          <SelectItem value="l">Liters (L)</SelectItem>
                          <SelectItem value="g">Grams (g)</SelectItem>
                          <SelectItem value="kg">Kilograms (kg)</SelectItem>
                          <SelectLabel>Packaging</SelectLabel>
                          <SelectItem value="bottle">Bottles</SelectItem>
                          <SelectItem value="pack">Packs</SelectItem>
                          <SelectItem value="box">Boxes</SelectItem>
                          <SelectItem value="piece">Pieces</SelectItem>
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
              name="lowStockThreshold"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Low Stock Threshold</FormLabel>
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

export default IngredientForm;
