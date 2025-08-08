"use client";

import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
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
import { Ingredient, IngredientStock } from "@prisma/client";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, Plus, Trash2, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type IngredientFormProps = {
  initialData: IngredientStock | null;
  ingredients: Ingredient[];
  userId: string;
};

// Schema for individual ingredient item
const ingredientItemSchema = z.object({
  ingredientId: z.string().min(1, "Ingredient is required"),
  quantity: z.coerce.number().min(1, "Quantity must be greater than 0"),
  status: z.string().min(1, "Status is required"),
  note: z.string().optional(),
});

// Main schema for the form
const ingredientStockSchema = z.object({
  items: z
    .array(ingredientItemSchema)
    .min(1, "At least one ingredient is required"),
});

type IngredientStockSchema = z.infer<typeof ingredientStockSchema>;

function IngredientStockForm({
  initialData,
  ingredients,
  userId,
}: IngredientFormProps) {
  const title = initialData
    ? "Update Ingredient Stock"
    : "Request Ingredients";
  const subtitle = initialData
    ? "Edit an ingredient stock"
    : "Request stock for ingredients";
  const toastMessage = initialData
    ? "Ingredient stock updated."
    : "Stock requests have been sent.";

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<IngredientStockSchema>({
    resolver: zodResolver(ingredientStockSchema),
    defaultValues: initialData
      ? {
          items: [
            {
              ingredientId: initialData.ingredientId,
              quantity: initialData.quantity,
              status: initialData.status,
              note: initialData.note || "",
            },
          ],
        }
      : {
          items: [
            {
              ingredientId: "",
              quantity: 0,
              status: "",
              note: "",
            },
          ],
        },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const addNewItem = () => {
    append({
      ingredientId: "",
      quantity: 0,
      status: "",
      note: "",
    });
  };

  const removeItem = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    } else {
      toast.warning("At least one ingredient is required");
    }
  };

  const validateStock = async (ingredientId: string, quantity: number) => {
    try {
      const ingredient = await axios
        .get(`/api/ingredient/${ingredientId}`)
        .then((res) => res.data);

      if (quantity > ingredient.stock) {
        return {
          isValid: false,
          message: `Request quantity must be less than current stock (${ingredient.stock} ${ingredient.unit})`,
          ingredient,
        };
      }
      return { isValid: true, ingredient };
    } catch (error) {
      console.error("Error validating stock:", error);
      return {
        isValid: false,
        message: "Error validating stock",
        ingredient: null,
      };
    }
  };

  const onSubmitted = async (data: IngredientStockSchema) => {
    try {
      setIsLoading(true);

      if (initialData) {
        // Handle single ingredient update (existing functionality)
        const item = data.items[0];
        await axios.patch(`/api/ingredientStock/${initialData.id}`, {
          ingredientId: item.ingredientId,
          quantity: item.quantity,
          status: item.status,
          note: item.note,
          userId,
        });
      } else {
        // Handle multiple ingredient requests
        const validationResults = await Promise.all(
          data.items.map(async (item) => {
            const result = await validateStock(
              item.ingredientId,
              item.quantity
            );
            return { ...result, item };
          })
        );

        // Check if all validations passed
        const invalidItems = validationResults.filter(
          (result) => !result.isValid
        );
        if (invalidItems.length > 0) {
          const errorMessages = invalidItems
            .map((result) => result.message)
            .join("\n");
          toast.error(errorMessages);
          return;
        }

        // Create requests for all valid items
        const requests = data.items.map(async (item) => {
          // Create stock usage request
          await axios.post("/api/stock-usage-request", {
            ingredientId: item.ingredientId,
            quantity: item.quantity,
            status: item.status,
            note: item.note,
            userId,
          });
        });

        await Promise.all(requests);

        // Create summary notification
        await axios.post("/api/notification", {
          title: "Multiple Stock Requests Sent",
          userId,
          message: `You have successfully submitted ${data.items.length} stock usage requests. Please wait for approval.`,
          type: "success",
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

  const getAvailableIngredients = (currentIndex: number) => {
    const selectedIds = form
      .watch("items")
      .map((item, index) => (index !== currentIndex ? item.ingredientId : null))
      .filter(Boolean);

    return ingredients.filter(
      (ingredient) => !selectedIds.includes(ingredient.id)
    );
  };

  return (
    <div className="space-y-6">
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
        <form onSubmit={form.handleSubmit(onSubmitted)} className="space-y-6">
          {/* Multiple Ingredient Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Package className="w-5 h-5" />
                Ingredient Requests
                <Badge variant="secondary">{fields.length} items</Badge>
              </h3>
              {!initialData && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addNewItem}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Ingredient
                </Button>
              )}
            </div>

            {fields.map((field, index) => {
              const availableIngredients = getAvailableIngredients(index);
              const selectedIngredient = ingredients.find(
                (ing) => ing.id === form.watch(`items.${index}.ingredientId`)
              );

              return (
                <Card key={field.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        Ingredient Request #{index + 1}
                      </CardTitle>
                      {!initialData && fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(index)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Ingredient Selection */}
                      <FormField
                        control={form.control}
                        name={`items.${index}.ingredientId`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ingredient *</FormLabel>
                            <FormControl>
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                                disabled={isLoading}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select ingredient" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectGroup>
                                    <SelectLabel>
                                      Available Ingredients
                                    </SelectLabel>
                                    {availableIngredients.map((item) => (
                                      <SelectItem key={item.id} value={item.id}>
                                        <div className="flex items-center justify-between w-full">
                                          <span>{item.name}</span>
                                          <Badge
                                            variant="outline"
                                            className="ml-2"
                                          >
                                            {item.stock} {item.unit}
                                          </Badge>
                                        </div>
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

                      {/* Quantity */}
                      <FormField
                        control={form.control}
                        name={`items.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Quantity *
                              {selectedIngredient && (
                                <span className="text-sm text-gray-500 ml-2">
                                  (Available: {selectedIngredient.stock}{" "}
                                  {selectedIngredient.unit})
                                </span>
                              )}
                            </FormLabel>
                            <FormControl>
                              <Input
                                disabled={isLoading}
                                type="number"
                                min="1"
                                max={selectedIngredient?.stock || undefined}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Status */}
                      <FormField
                        control={form.control}
                        name={`items.${index}.status`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status *</FormLabel>
                            <FormControl>
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                                disabled={isLoading}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectGroup>
                                    <SelectLabel>Usage Status</SelectLabel>
                                    <SelectItem value="Use">Use</SelectItem>
                                    <SelectItem value="Expired">
                                      Expired
                                    </SelectItem>
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Individual Note */}
                      <FormField
                        control={form.control}
                        name={`items.${index}.note`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Item Note</FormLabel>
                            <FormControl>
                              <Textarea
                                disabled={isLoading}
                                placeholder="Specific note for this ingredient..."
                                {...field}
                                className="min-h-[80px]"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          {/* Submit Button */}
          <div className="flex gap-4">
            <Button disabled={isLoading} type="submit" size="lg">
              {isLoading && <CgSpinnerTwoAlt className="animate-spin mr-2" />}
              {isLoading
                ? initialData
                  ? "Saving Changes..."
                  : "Sending Requests..."
                : initialData
                ? "Save Changes"
                : `Submit ${fields.length} Request${
                    fields.length > 1 ? "s" : ""
                  }`}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default IngredientStockForm;
