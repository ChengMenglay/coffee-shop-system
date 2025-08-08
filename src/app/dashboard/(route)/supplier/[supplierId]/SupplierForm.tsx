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
import { Ingredient, Supplier } from "@prisma/client";
import { ChevronLeft } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

type SupplierFormProps = {
  initialData: (Supplier & { suppliedIngredients: Ingredient[] }) | null;
  ingredients: Ingredient[];
};
const supplierSchema = z.object({
  name: z.string().min(1, "Name is required"),
  contact: z.string().min(1, "Contact is required"),
  isActive: z.boolean(),
  suppliedIngredients: z.array(z.string()),
});
type SupplierSchema = z.infer<typeof supplierSchema>;
function SupplierForm({ initialData, ingredients }: SupplierFormProps) {
  const title = initialData ? "Update Supplier" : "Create Supplier";
  const subtitle = initialData ? "Edit an Supplier" : "Add a new Supplier";
  const toastMessage = initialData ? "Supplier updated." : "Supplier created";
  const router = useRouter();
  const form = useForm<SupplierSchema>({
    resolver: zodResolver(supplierSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          suppliedIngredients: initialData.suppliedIngredients.map(
            (item) => item.id
          ),
        }
      : {
          name: "",
          contact: "",
          isActive: false,
          suppliedIngredients: [],
        },
  });
  const [isLoading, setIsLoading] = useState(false);
  const onSubmitted = async (data: SupplierSchema) => {
    try {
      setIsLoading(true);
      if (initialData) {
        await axios.patch(`/api/supplier/${initialData.id}`, data);
      } else {
        await axios.post("/api/supplier", data);
      }
      toast.success(toastMessage);
      router.push("/dashboard/supplier");
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
                  <FormLabel>Supplier</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      placeholder="Supplier name..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact</FormLabel>
                  <FormControl>
                    <Input disabled={isLoading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supplier Status</FormLabel>
                  <FormControl>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <span>Is Active?</span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="suppliedIngredients"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ingredient Supplied</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
                      {ingredients.map((item) => (
                        <div
                          className="flex items-center space-x-2"
                          key={item.id}
                        >
                          <Checkbox
                            id={`ingredient-${item.id}`} // unique ID
                            checked={field.value.includes(item.id)}
                            onCheckedChange={(checked) => {
                              const updatedIngredients = checked
                                ? [...field.value, item.id]
                                : field.value.filter((id) => id !== item.id);
                              field.onChange(updatedIngredients);
                            }}
                          />
                          <Label
                            htmlFor={`ingredient-${item.id}`}
                            className="text-sm"
                          >
                            {item.name}
                          </Label>
                        </div>
                      ))}
                    </div>
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

export default SupplierForm;
