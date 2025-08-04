"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  Form,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { Button } from "@/components/ui/button";
import { CgSpinnerTwoAlt } from "react-icons/cg";
import { toast } from "sonner";
import axios from "axios";
import { useRouter } from "next/navigation";

const ingredientSchema = z.object({
  name: z.string().min(1, "Ingredient is required"),
  stock: z.coerce.number().min(0, "Stock must be 0 or greater"),
  unit: z.string().min(1, "Unit is required"),
  lowStockThreshold: z.coerce
    .number()
    .min(1, "Low stock threshold must be greater than 0"),
});

type IngredientSchema = z.infer<typeof ingredientSchema>;

interface IngredientDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function IngredientDialog({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: IngredientDialogProps = {}) {
  const form = useForm<IngredientSchema>({
    resolver: zodResolver(ingredientSchema),
    defaultValues: {
      name: "",
      stock: 0,
      unit: "",
      lowStockThreshold: 1,
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [internalOpen, setInternalOpen] = useState(true);
  const router = useRouter();

  // Use controlled state if provided, otherwise use internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;

  const onSubmitted = async (data: IngredientSchema) => {
    try {
      setIsLoading(true);

      await axios.post("/api/ingredient", data);

      toast.success("Ingredient created successfully");
      form.reset(); // Reset the form after successful submission
      setOpen(false); // Close dialog
      router.refresh();
    } catch (error) {
      console.error("Error creating ingredient:", error);
      toast.error("Something went wrong!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isLoading) {
      // Prevent closing while loading
      setOpen(newOpen);
      if (!newOpen) {
        form.reset(); // Reset form when dialog closes
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmitted)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Create Ingredient</DialogTitle>
              <DialogDescription>
                Please fill out the form below to create a new ingredient.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ingredient Name *</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        placeholder="Enter ingredient name..."
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
                    <FormLabel>Initial Stock</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        type="number"
                        min="0"
                        step="1"
                        placeholder="0"
                        {...field}
                      />
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
                    <FormLabel>Unit *</FormLabel>
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
                    <FormLabel>Low Stock Alert Threshold *</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        type="number"
                        min="1"
                        step="1"
                        placeholder="10"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="min-w-[100px]"
              >
                {isLoading ? (
                  <>
                    <CgSpinnerTwoAlt className="animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  "Create Ingredient"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default IngredientDialog;
