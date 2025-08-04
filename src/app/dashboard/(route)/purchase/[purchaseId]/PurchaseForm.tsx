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
import { Ingredient, Supplier } from "@/generated/prisma";
import {
  ChevronLeft,
  Plus,
  Trash2,
  ShoppingCart,
  DollarSign,
} from "lucide-react";
import { Purchase } from "types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import IngredientDialog from "./IngredientDialog";
import SupplierDialog from "./SupplierDialog";

type SupplierWithIngredients = Supplier & {
  suppliedIngredients: Ingredient[];
};

type PurchaseColumnProps = {
  initialData: Purchase | null;
  ingredients: Ingredient[];
  suppliers: SupplierWithIngredients[];
  userId: string | null;
};

// Schema for individual purchase item
const purchaseItemSchema = z.object({
  ingredientId: z.string().min(1, "Ingredient is required"),
  price: z.coerce.number().min(0.01, "Price must be greater than 0"),
  quantity: z.coerce.number().min(1, "Quantity must be greater than 0"),
  supplierId: z.string().min(1, "Supplier is required"),
});

// Main schema for the form
const purchaseSchema = z.object({
  items: z
    .array(purchaseItemSchema)
    .min(1, "At least one purchase is required"),
  generalNote: z.string().optional(),
});

type PurchaseSchema = z.infer<typeof purchaseSchema>;
function PurchaseForm({
  initialData,
  ingredients,
  suppliers,
  userId,
}: PurchaseColumnProps) {
  const [dialogIngredientOpen, setDialogIngredientOpen] = useState(false);
  const [dialogSupplierOpen, setDialogSupplierOpen] = useState(false);
  const title = initialData ? "Update Purchase" : "Request Purchases";
  const subtitle = initialData
    ? "Edit a Purchase"
    : "Request purchases for multiple ingredients";
  const toastMessage = initialData
    ? "Purchase updated."
    : "Purchase requests have been sent.";

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<PurchaseSchema>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: initialData
      ? {
          items: [
            {
              ingredientId: initialData.ingredientId,
              price:
                typeof initialData.price === "object" &&
                "toNumber" in initialData.price
                  ? initialData.price
                  : Number(initialData.price),
              quantity: Number(initialData?.quantity),
              supplierId: initialData.supplierId,
            },
          ],
        }
      : {
          items: [
            {
              ingredientId: "",
              price: 0,
              quantity: 0,
              supplierId: "",
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
      price: 0,
      quantity: 0,
      supplierId: "",
    });
  };

  const removeItem = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    } else {
      toast.warning("At least one purchase is required");
    }
  };

  const onSubmitted = async (data: PurchaseSchema) => {
    try {
      setIsLoading(true);

      if (initialData) {
        // Handle single purchase update (existing functionality)
        const item = data.items[0];
        await axios.patch(`/api/purchase/${initialData.id}`, {
          ingredientId: item.ingredientId,
          supplierId: item.supplierId,
          userId,
          quantity: item.quantity,
          price: Number(item.price),
        });
      } else {
        // Handle multiple purchase requests
        const requests = data.items.map(async (item) => {
          // Create purchase request
          await axios.post("/api/purchase-request", {
            ingredientId: item.ingredientId,
            supplierId: item.supplierId,
            userId,
            quantity: item.quantity,
            price: Number(item.price),
          });
        });

        await Promise.all(requests);

        // Create summary notification
        await axios.post("/api/notification", {
          title: "Purchase Requests Sent",
          userId,
          message: `You have successfully submitted ${data.items.length} purchase requests. Please wait for approval.`,
          type: "success",
        });
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

  const getAvailableIngredients = (currentIndex: number) => {
    const selectedIds = form
      .watch("items")
      .map((item, index) => (index !== currentIndex ? item.ingredientId : null))
      .filter(Boolean);

    return ingredients.filter(
      (ingredient) => !selectedIds.includes(ingredient.id)
    );
  };

  const getAvailableSuppliers = (ingredientId: string) => {
    return suppliers.filter((supplier) =>
      supplier.suppliedIngredients.some(
        (ingredient) => ingredient.id === ingredientId
      )
    );
  };

  const calculateItemTotal = (price: number, quantity: number) => {
    return (price * quantity).toFixed(2);
  };

  const calculateGrandTotal = () => {
    return form
      .watch("items")
      .reduce((total, item) => {
        return total + Number(item.price) * Number(item.quantity);
      }, 0)
      .toFixed(2);
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
          {/* Multiple Purchase Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex md:flex-row flex-col items-center">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Purchase Requests
                </h3>{" "}
                <Badge variant="secondary">{fields.length} items</Badge>
                <Badge variant="outline" className="ml-2">
                  Total: ${calculateGrandTotal()}
                </Badge>
              </div>
              <div className="flex itecms-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDialogIngredientOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Ingredient
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDialogSupplierOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Supplier
                </Button>
                {!initialData && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addNewItem}
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Purchase
                  </Button>
                )}
              </div>
            </div>

            {fields.map((field, index) => {
              const availableIngredients = getAvailableIngredients(index);
              const selectedIngredientId = form.watch(
                `items.${index}.ingredientId`
              );
              const selectedIngredient = ingredients.find(
                (ing) => ing.id === selectedIngredientId
              );
              const availableSuppliers =
                getAvailableSuppliers(selectedIngredientId);
              const itemPrice = form.watch(`items.${index}.price`) || 0;
              const itemQuantity = form.watch(`items.${index}.quantity`) || 0;
              const itemTotal = calculateItemTotal(itemPrice, itemQuantity);

              return (
                <Card key={field.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CardTitle className="md:text-base text-sm">
                          Purchase Request #{index + 1}
                        </CardTitle>
                        {Number(itemTotal) > 0 && (
                          <Badge className="bg-green-100 text-green-700">
                            <DollarSign className="w-3 h-3 mr-1" />${itemTotal}
                          </Badge>
                        )}
                      </div>
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
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  // Reset supplier when ingredient changes
                                  form.setValue(
                                    `items.${index}.supplierId`,
                                    ""
                                  );
                                }}
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
                                            {item.stock + " " + item.unit}
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
                                  ({selectedIngredient.unit})
                                </span>
                              )}
                            </FormLabel>
                            <FormControl>
                              <Input
                                disabled={isLoading}
                                type="number"
                                min="1"
                                step="1"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Price per unit */}
                      <FormField
                        control={form.control}
                        name={`items.${index}.price`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price per unit ($) *</FormLabel>
                            <FormControl>
                              <Input
                                disabled={isLoading}
                                type="number"
                                min="0"
                                step="0.01"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Supplier */}
                      <FormField
                        control={form.control}
                        name={`items.${index}.supplierId`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Supplier *</FormLabel>
                            <FormControl>
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                                disabled={isLoading || !selectedIngredientId}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select supplier" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectGroup>
                                    <SelectLabel>
                                      Available Suppliers
                                    </SelectLabel>
                                    {availableSuppliers.length > 0 ? (
                                      availableSuppliers.map((supplier) => (
                                        <SelectItem
                                          key={supplier.id}
                                          value={supplier.id}
                                        >
                                          {supplier.name}
                                        </SelectItem>
                                      ))
                                    ) : (
                                      <div className="p-2 text-muted-foreground text-sm">
                                        {selectedIngredientId
                                          ? "No suppliers available for this ingredient"
                                          : "Select an ingredient first"}
                                      </div>
                                    )}
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
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
          {/* Total Summary */}
          {!initialData && fields.length > 1 && (
            <Card className="bg-gray-50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between text-lg font-semibold">
                  <span>Grand Total:</span>
                  <span className="text-green-600">
                    ${calculateGrandTotal()}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

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
      <IngredientDialog
        open={dialogIngredientOpen}
        onOpenChange={setDialogIngredientOpen}
      />
      <SupplierDialog ingredients={ingredients} open={dialogSupplierOpen} onOpenChange={setDialogSupplierOpen} />
    </div>
  );
}

export default PurchaseForm;
