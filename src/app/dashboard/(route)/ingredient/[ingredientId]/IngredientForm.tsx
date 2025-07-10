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

const ingredientSchema = z.object({
  name: z.string().min(1, "Ingrediet is required"),
  stock: z.coerce.number(),
  unit: z.string().min(1, "Unit is required"),
  lowStockThreshold: z.coerce.number(),
});
type IngredientSchema = z.infer<typeof ingredientSchema>;
function IngredientForm() {
  const form = useForm<IngredientSchema>({
    resolver: zodResolver(ingredientSchema),
    defaultValues: {
      name: "",
      stock: 0,
      unit: "",
      lowStockThreshold: 0,
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const onSubmitted = async (data: IngredientSchema) => {
    try {
      setIsLoading(true);
      console.log(data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <>
      <div className="flex overflow-y-auto items-center justify-between">
        <Header title="Create Ingredient" subtitle="Add a new ingredient" />
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
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={"Select a unit"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Unit</SelectLabel>
                          <SelectItem value="ml">ML</SelectItem>
                          <SelectItem value="g">G</SelectItem>
                          <SelectItem value="kg">KG</SelectItem>
                          <SelectItem value="bottle">Bottles</SelectItem>
                          <SelectItem value="l">Liters (L)</SelectItem>
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
            {isLoading ? "Creating..." : "Create"}
          </Button>
        </form>
      </Form>
    </>
  );
}

export default IngredientForm;
