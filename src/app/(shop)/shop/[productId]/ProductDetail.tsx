"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import useCart from "@/hooks/use-cart";
import useSheet from "@/hooks/use-sheet";
import { formatterUSD } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { ExtraShot, Product, Size, Ice, Sugar } from "types";
import z from "zod";

const formSchema = z.object({
  productId: z.string(),
  sizeId: z.string().min(1, "Size is required"),
  sugarId: z.string().min(1, "Sugar level is required"),
  iceId: z.string().optional(),
  extraShotId: z.string().optional(),
  note: z.string().optional(),
});

type FormSchema = z.infer<typeof formSchema>;

function ProductDetail({
  product,
  sizes,
  sugars,
  ices,
  extraShots,
}: {
  product: Product;
  sizes: Size[] | null;
  sugars: Sugar[];
  ices: Ice[];
  extraShots: ExtraShot[];
}) {
  const { addItem } = useCart();
  const { onOpen } = useSheet();
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productId: product?.id || "",
      sizeId: "",
      sugarId: "",
      iceId: "",
      extraShotId: "",
      note: "",
    },
  });

  // Watch form values to calculate price preview
  const watchedValues = form.watch();

  // Calculate preview price based on current selections
  const calculatePreviewPrice = () => {
    if (!watchedValues.sizeId) return Number(product.price);

    const selectedSize = sizes?.find(
      (size) => size.id === watchedValues.sizeId
    );
    const selectedExtraShot = extraShots.find(
      (shot) => shot.id === watchedValues.extraShotId
    );

    let price = Number(product.price);

    // Add size modifier
    if (selectedSize?.priceModifier) {
      price += Number(selectedSize.priceModifier);
    }

    // Add extra shot modifier
    if (selectedExtraShot?.priceModifier) {
      price += Number(selectedExtraShot.priceModifier);
    }

    // Apply product discount if exists
    const productDiscount = Number(product.discount) || 0;
    if (productDiscount > 0) {
      const discountAmount = price * (productDiscount / 100);
      price = price - discountAmount;
    }

    return price;
  };

  const onSubmit = (data: FormSchema) => {
    // Find selected options
    const selectedSize = sizes?.find((size) => size.id === data.sizeId);
    const selectedSugar = sugars.find((sugar) => sugar.id === data.sugarId);
    const selectedIce = ices.find((ice) => ice.id === data.iceId);
    const selectedExtraShot = extraShots.find(
      (shot) => shot.id === data.extraShotId
    );

    // Validate required selections
    if (!selectedSize) {
      form.setError("sizeId", { message: "Please select a size" });
      return;
    }

    if (!selectedSugar) {
      form.setError("sugarId", { message: "Please select sugar level" });
      return;
    }

    // Add item to cart with all customizations in one go
    addItem(product, {
      defaultSizeId: selectedSize.id,
      defaultSizeName: selectedSize.sizeName,
      defaultSizeModifier: Number(selectedSize.priceModifier) || 0,
      sugar: selectedSugar.name,
      sugarId: selectedSugar.id,
      ice: selectedIce?.name,
      iceId: selectedIce?.id,
      extraShotId: selectedExtraShot?.id,
      extraShotName: selectedExtraShot?.name,
      extraShotModifier: Number(selectedExtraShot?.priceModifier) || 0,
      note: data.note,
    });

    // Reset form after successful addition
    form.reset({
      productId: product.id,
      sizeId: "",
      sugarId: "",
      iceId: "",
      extraShotId: "",
      note: "",
    });
    onOpen();
  };

  const previewPrice = calculatePreviewPrice();
  const originalPrice = Number(product.price);
  const hasDiscount = Number(product.discount) > 0;

  return (
    <div className="grid md:grid-cols-2 grid-cols-1 gap-4 p-4">
      <div className="lg:w-96 lg:h-96 md:w-80 md:h-80 w-full h-96 cursor-pointer relative mx-auto">
        <Image
          src={product?.image as string}
          alt={product?.name as string}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover rounded-md"
        />
      </div>

      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold">{product?.name}</h1>
          <p className="text-sm text-gray-500 my-2">{product?.description}</p>

          {/* Price Display */}
          <div className="flex items-center gap-2 my-3">
            <span className="text-2xl font-bold text-green-600">
              {formatterUSD.format(previewPrice)}
            </span>
            {hasDiscount && watchedValues.sizeId && (
              <span className="text-lg text-gray-500 line-through">
                {formatterUSD.format(
                  originalPrice +
                    (sizes?.find((s) => s.id === watchedValues.sizeId)
                      ?.priceModifier || 0) +
                    (extraShots.find((e) => e.id === watchedValues.extraShotId)
                      ?.priceModifier || 0)
                )}
              </span>
            )}
            {hasDiscount && (
              <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-sm font-medium">
                {product.discount}% OFF
              </span>
            )}
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Size Selection */}
            <FormField
              control={form.control}
              name="sizeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold">
                    Available Sizes *
                  </FormLabel>
                  <FormControl>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {sizes?.map((size) => {
                        const sizePrice =
                          Number(product.price) +
                          Number(size.priceModifier || 0);
                        const discountedSizePrice = hasDiscount
                          ? sizePrice -
                            sizePrice * (Number(product.discount) / 100)
                          : sizePrice;

                        return (
                          <div
                            key={size.id}
                            onClick={() =>
                              field.onChange(
                                field.value === size.id ? "" : size.id
                              )
                            }
                            className={`py-2 px-3 border rounded-md flex flex-col items-center cursor-pointer transition-all duration-200 ${
                              field.value === size.id
                                ? "shadow-md bg-green-100 border-green-300"
                                : "hover:bg-gray-50"
                            }`}
                          >
                            <h1 className="font-medium">
                              {size.sizeName === "large"
                                ? "L"
                                : size.sizeName === "medium"
                                ? "M"
                                : "S"}
                            </h1>
                            <h2 className="text-sm font-bold">
                              {formatterUSD.format(discountedSizePrice)}
                            </h2>
                            {hasDiscount && (
                              <h3 className="text-xs text-gray-500 line-through">
                                {formatterUSD.format(sizePrice)}
                              </h3>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Sugar Level Selection */}
            {sugars.length > 0 && (
              <FormField
                control={form.control}
                name="sugarId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold">
                      Sugar Level *
                    </FormLabel>
                    <FormControl>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {sugars?.map((sugar) => (
                          <div
                            key={sugar.id}
                            onClick={() =>
                              field.onChange(
                                field.value === sugar.id ? "" : sugar.id
                              )
                            }
                            className={`p-2 border rounded-md flex flex-col items-center cursor-pointer transition-all duration-200 min-w-[80px] ${
                              field.value === sugar.id
                                ? "shadow-md bg-green-100 border-green-300"
                                : "hover:bg-gray-50"
                            }`}
                          >
                            <h1 className="text-sm font-medium">
                              {sugar.name}
                            </h1>
                          </div>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Ice Level Selection */}
            {ices.length > 0 && (
              <FormField
                control={form.control}
                name="iceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold">
                      Ice Level
                    </FormLabel>
                    <FormControl>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {ices?.map((ice) => (
                          <div
                            key={ice.id}
                            onClick={() =>
                              field.onChange(
                                field.value === ice.id ? "" : ice.id
                              )
                            }
                            className={`p-2 border rounded-md flex flex-col items-center cursor-pointer transition-all duration-200 min-w-[80px] ${
                              field.value === ice.id
                                ? "shadow-md bg-green-100 border-green-300"
                                : "hover:bg-gray-50"
                            }`}
                          >
                            <h1 className="text-sm font-medium">{ice.name}</h1>
                          </div>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Extra Shots Selection */}
            {extraShots.length > 0 && (
              <FormField
                control={form.control}
                name="extraShotId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold">
                      Extra Shots
                    </FormLabel>
                    <FormControl>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {extraShots?.map((extraShot) => (
                          <div
                            key={extraShot.id}
                            onClick={() =>
                              field.onChange(
                                field.value === extraShot.id ? "" : extraShot.id
                              )
                            }
                            className={`p-2 border rounded-md flex flex-col items-center cursor-pointer transition-all duration-200 min-w-[100px] ${
                              field.value === extraShot.id
                                ? "shadow-md bg-green-100 border-green-300"
                                : "hover:bg-gray-50"
                            }`}
                          >
                            <h1 className="text-sm font-medium">
                              {extraShot.name}
                            </h1>
                            <h2 className="text-sm font-bold text-green-600">
                              +
                              {formatterUSD.format(
                                Number(extraShot.priceModifier)
                              )}
                            </h2>
                          </div>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Special Instructions */}
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold">
                    Special Instructions
                  </FormLabel>
                  <FormControl>
                    <div>
                      <Textarea
                        {...field}
                        placeholder="Add any special instructions or notes..."
                        className="resize-none min-h-[100px]"
                        maxLength={500}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {field.value?.length || 0}/500 characters
                      </p>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 items-center">
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-500 cursor-pointer flex-1"
                disabled={!watchedValues.sizeId || !watchedValues.sugarId}
              >
                Add to Cart - {formatterUSD.format(previewPrice)}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}

export default ProductDetail;
