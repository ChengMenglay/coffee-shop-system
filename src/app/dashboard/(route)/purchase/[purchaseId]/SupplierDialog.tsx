"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
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
import { toast } from "sonner";
import axios from "axios";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CgSpinnerTwoAlt } from "react-icons/cg";
import { Ingredient } from "@prisma/client";

interface SupplierDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  ingredients: Ingredient[];
}

const supplierSchema = z.object({
  name: z.string().min(1, "Name is required"),
  contact: z.string().optional(),
  isActive: z.boolean(),
  suppliedIngredients: z.array(z.string()),
});
type SupplierSchema = z.infer<typeof supplierSchema>;

function SupplierDialog({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  ingredients,
}: SupplierDialogProps) {
  const form = useForm<SupplierSchema>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: "",
      contact: "",
      isActive: false,
      suppliedIngredients: [],
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const [internalOpen, setInternalOpen] = useState(true);
  const router = useRouter();
  // Use controlled state if provided, otherwise use internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;
  const onSubmitted = async (data: SupplierSchema) => {
    try {
      setIsLoading(true);
      await axios.post("/api/supplier", data);
      toast.success("Supplier saved successfully!");
      form.reset();
      setOpen(false);
      router.refresh();
    } catch (error) {
      console.log(error);
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
              <DialogTitle>Create Supplier</DialogTitle>
              <DialogDescription>
                Please fill out the form below to create a new supplier.
              </DialogDescription>
            </DialogHeader>

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

export default SupplierDialog;
