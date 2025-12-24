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

import { toast } from "sonner";
import axios from "axios";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Promotion } from "types";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PromotionType } from "@prisma/client";
import { Checkbox } from "@/components/ui/checkbox";
type PromotionFormProps = {
  initialData: Promotion | null;
};
const promotionSchema = z.object({
  name: z.string().min(1, "Promotion name is required"),
  type: z.string().min(1, "Promotion type is required"),
  buyQuantity: z
    .number()
    .min(1, "Buy quantity must be at least 1")
    .optional()
    .nullable(),
  freeQuantity: z
    .number()
    .min(1, "Free quantity must be at least 1")
    .optional()
    .nullable(),
  discount: z
    .number()
    .min(0, "Discount must be at least 0")
    .optional()
    .nullable(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  isActive: z.boolean(),
});
type PromotionSchema = z.infer<typeof promotionSchema>;
function PromotionForm({ initialData }: PromotionFormProps) {
  const title = initialData ? "Update Promotion" : "Create Promotion";
  const subtitle = initialData ? "Edit a promotion" : "Add a new promotion";
  const toastMessage = initialData ? "Promotion updated." : "Promotion created";
  const router = useRouter();
  const form = useForm<PromotionSchema>({
    resolver: zodResolver(promotionSchema),
    defaultValues: initialData
      ? { ...initialData }
      : {
          name: "",
          type: "",
          buyQuantity: null,
          freeQuantity: null,
          discount: null,
          startDate: undefined,
          endDate: undefined,
          isActive: undefined,
        },
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<PromotionType | null>(null);
  const onSubmitted = async (data: PromotionSchema) => {
    try {
      setIsLoading(true);
      if (initialData) {
        await axios.patch(`/api/promotion/${initialData.id}`, data);
      } else {
        await axios.post("/api/promotion", data);
      }
      toast.success(toastMessage);
      router.push("/dashboard/promotion");
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
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      placeholder="Promotion name..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        setSelectedType(value as PromotionType);
                        field.onChange(value);
                      }}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={"Select a size"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value={PromotionType.BUY_X_GET_Y}>
                            Buy X Get Y
                          </SelectItem>
                          <SelectItem value={PromotionType.FIXED_DISCOUNT}>
                            Fixed Discount
                          </SelectItem>
                          <SelectItem value={PromotionType.PERCENT_DISCOUNT}>
                            Percent Discount
                          </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {(selectedType === PromotionType.BUY_X_GET_Y ||
              initialData?.type === PromotionType.BUY_X_GET_Y) && (
              <>
                <FormField
                  control={form.control}
                  name="buyQuantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Buy Quantity</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || 0}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                          type="number"
                          disabled={isLoading}
                          placeholder="Buy quantity..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="freeQuantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Free Quantity</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || 0}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                          type="number"
                          disabled={isLoading}
                          placeholder="Free quantity..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            {(selectedType === PromotionType.FIXED_DISCOUNT ||
              initialData?.type === PromotionType.FIXED_DISCOUNT) && (
              <FormField
                control={form.control}
                name="discount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount Amount </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || 0}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        type="number"
                        disabled={isLoading}
                        placeholder="Discount amount..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {(selectedType === PromotionType.PERCENT_DISCOUNT ||
              initialData?.type === PromotionType.PERCENT_DISCOUNT) && (
              <FormField
                control={form.control}
                name="discount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount Percent </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || 0}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        type="number"
                        disabled={isLoading}
                        placeholder="Discount percent..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
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
                      onChange={(e) => field.onChange(e.target.value)}
                      type="date"
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                      onChange={(e) => field.onChange(e.target.value)}
                      type="date"
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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

export default PromotionForm;
