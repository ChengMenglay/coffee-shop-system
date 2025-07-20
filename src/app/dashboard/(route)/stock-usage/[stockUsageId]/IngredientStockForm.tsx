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
import { Ingredient, IngredientStock } from "@/generated/prisma";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft } from "lucide-react";

type IngredientFormProps = {
  initialData: IngredientStock | null;
  ingredients: Ingredient[];
  userId: string;
};
const ingredientStockSchema = z.object({
  ingredientId: z.string().min(1, "Ingrediet is required"),
  quantity: z.coerce.number(),
  status: z.string().min(1, "Unit is required"),
  note: z.string().nullable(),
});
type IngredientStockSchema = z.infer<typeof ingredientStockSchema>;
function IngredientStockForm({
  initialData,
  ingredients,
  userId,
}: IngredientFormProps) {
  const title = initialData
    ? "Update Ingredient Stock"
    : "Request Ingredient Stock";
  const subtitle = initialData
    ? "Edit an ingredient stock"
    : "Add a new ingredient Stock";
  const toastMessage = initialData
    ? "Ingredient stock updated."
    : "Request has been sent.";
  const router = useRouter();
  const form = useForm<IngredientStockSchema>({
    resolver: zodResolver(ingredientStockSchema),
    defaultValues: initialData
      ? { ...initialData }
      : {
          ingredientId: "",
          quantity: 0,
          status: "",
          note: "",
        },
  });
  const [isLoading, setIsLoading] = useState(false);
  const onSubmitted = async (data: IngredientStockSchema) => {
    try {
      if (data.quantity <= 0) {
        toast.warning("Stock must be greater than 0");
        return;
      }
      setIsLoading(true);
      if (initialData) {
        await axios.patch(`/api/ingredientStock/${initialData.id}`, {
          ingredientId: data.ingredientId,
          quantity: data.quantity,
          status: data.status,
          note: data.note,
          userId,
        });
      } else {
        await axios.post("/api/stock-usage-request", {
          ingredientId: data.ingredientId,
          quantity: data.quantity,
          status: data.status,
          note: data.note,
          userId,
        });
        const ingredient = await axios
          .get(`/api/ingredient/${data.ingredientId}`)
          .then((res) => res.data);
        await axios.post("/api/notification", {
          title: "Stock Usage Request Sent",
          userId,
          message: `Your stock usage request for ${
            data.quantity + " " + ingredient.unit
          } of ${
            ingredient.name
          } has been sent. Please wait for someone approve.`,
          type: "info",
        });
      }
      toast.success(toastMessage);
      router.push("/dashboard/stock-usage");
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
                          <SelectLabel>Ingredient</SelectLabel>
                          {ingredients.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.name + ` (${item.unit})`}
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
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={"Select a status"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Status</SelectLabel>
                          <SelectItem value="Use">Use</SelectItem>
                          <SelectItem value="Expired">Expired</SelectItem>
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
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note</FormLabel>
                  <FormControl>
                    <Textarea
                      disabled={isLoading}
                      placeholder=""
                      {...field}
                      value={field.value ?? ""}
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
                : "Sending..."
              : initialData
              ? "Save Change"
              : "Request"}
          </Button>
        </form>
      </Form>
    </>
  );
}

export default IngredientStockForm;
