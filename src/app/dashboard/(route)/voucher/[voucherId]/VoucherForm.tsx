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
import { useState } from "react";
import { CgSpinnerTwoAlt } from "react-icons/cg";
import { toast } from "sonner";
import axios from "axios";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Voucher } from "types";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import z from "zod";

// Zod schema for voucher
const voucherSchema = z.object({
  code: z.string().min(1, "Voucher code is required"),
  description: z.string().optional().nullable(),
  discountType: z.enum(["FIXED", "PERCENT"], {
    errorMap: () => ({ message: "Invalid discount type" }),
  }),
  discountValue: z
    .number({ invalid_type_error: "Discount value is required" })
    .positive("Discount value must be positive"),
  minOrderTotal: z
    .number()
    .nonnegative("Min order total cannot be negative")
    .optional()
    .nullable(),
  maxDiscount: z
    .number()
    .nonnegative("Max discount cannot be negative")
    .optional()
    .nullable(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  usageLimit: z
    .number()
    .int("Usage limit must be an integer")
    .nonnegative("Usage limit cannot be negative")
    .optional()
    .nullable(),
  perUserLimit: z
    .number()
    .int("Per user limit must be an integer")
    .nonnegative("Per user limit cannot be negative")
    .optional()
    .nullable(),
  isActive: z.boolean(),
});

type VoucherFormSchema = z.infer<typeof voucherSchema>;

type VoucherFormProps = {
  initialData: Voucher | null;
};

function VoucherForm({ initialData }: VoucherFormProps) {
  const title = initialData ? "Update Voucher" : "Create Voucher";
  const subtitle = initialData ? "Edit a voucher" : "Add a new voucher";
  const toastMessage = initialData ? "Voucher updated." : "Voucher created";

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<VoucherFormSchema>({
    resolver: zodResolver(voucherSchema),
    defaultValues: initialData
      ? { ...initialData }
      : {
          code: "",
          description: "",
          discountType: "FIXED",
          discountValue: 0,
          minOrderTotal: null,
          maxDiscount: null,
          startDate: new Date(),
          endDate: new Date(),
          usageLimit: null,
          perUserLimit: null,
          isActive: true, //
        },
  });

  const onSubmitted = async (data: VoucherFormSchema) => {
    try {
      setIsLoading(true);
      if (initialData) {
        await axios.patch(`/api/voucher/${initialData.id}`, data);
      } else {
        await axios.post("/api/voucher", data);
      }
      toast.success(toastMessage);
      router.push("/dashboard/voucher");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex overflow-y-auto items-center justify-between">
        <div className="flex space-x-6">
          <Button onClick={() => router.back()} variant="outline" size="icon">
            <ChevronLeft />
          </Button>
          <Header title={title} subtitle={subtitle} />
        </div>
      </div>

      <Separator />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmitted)} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {/* Code */}
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Voucher Code</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      placeholder="Voucher code..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      placeholder="Description..."
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Discount Type */}
            <FormField
              control={form.control}
              name="discountType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Discount Type</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select discount type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="FIXED">Fixed</SelectItem>
                          <SelectItem value="PERCENT">Percent</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Discount Value */}
            <FormField
              control={form.control}
              name="discountValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Discount Value</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || 0}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      type="number"
                      disabled={isLoading}
                      placeholder="Discount value..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Min Order Total */}
            <FormField
              control={form.control}
              name="minOrderTotal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Order Total</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? Number(e.target.value) : null
                        )
                      }
                      type="number"
                      disabled={isLoading}
                      placeholder="Minimum order total..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Max Discount */}
            <FormField
              control={form.control}
              name="maxDiscount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Discount</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? Number(e.target.value) : null
                        )
                      }
                      type="number"
                      disabled={isLoading}
                      placeholder="Maximum discount..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Start Date */}
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={
                        field.value
                          ? new Date(field.value).toISOString().split("T")[0]
                          : ""
                      }
                      onChange={(e) => field.onChange(new Date(e.target.value))}
                      type="date"
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* End Date */}
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={
                        field.value
                          ? new Date(field.value).toISOString().split("T")[0]
                          : ""
                      }
                      onChange={(e) => field.onChange(new Date(e.target.value))}
                      type="date"
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Usage Limit */}
            <FormField
              control={form.control}
              name="usageLimit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Usage Limit</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? Number(e.target.value) : null
                        )
                      }
                      type="number"
                      disabled={isLoading}
                      placeholder="Usage limit..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Per User Limit */}
            <FormField
              control={form.control}
              name="perUserLimit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Per User Limit</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? Number(e.target.value) : null
                        )
                      }
                      type="number"
                      disabled={isLoading}
                      placeholder="Per user limit..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Is Active */}
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Is Active</FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </div>

          {/* Submit Button */}
          <Button disabled={isLoading} type="submit">
            {isLoading && <CgSpinnerTwoAlt className="animate-spin" />}
            {isLoading
              ? initialData
                ? "Saving..."
                : "Creating..."
              : initialData
              ? "Save Changes"
              : "Create"}
          </Button>
        </form>
      </Form>
    </>
  );
}

export default VoucherForm;
