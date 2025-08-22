"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import useCart, { CartItem } from "@/hooks/use-cart";
import { formatterUSD } from "@/lib/utils";
import { ArrowRight, Trash, XCircleIcon } from "lucide-react";
import Image from "next/image";
import React, { useCallback, useState } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { CgSpinnerTwoAlt } from "react-icons/cg";
import NoResult from "@/components/NoResult";
import { Size, Sugar, Ice, ExtraShot, Promotion } from "types";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect } from "react";

type CartStoreProps = {
  sizes: Size[] | null;
  sugars?: Sugar[] | null;
  ices?: Ice[] | null;
  extraShots?: ExtraShot[] | null;
  promotions?: Promotion[] | null;
  disabled?: boolean;
};

export default function CartStore({
  sizes,
  sugars,
  ices,
  extraShots,
  promotions,
  disabled = false,
}: CartStoreProps) {
  const {
    items,
    removeAll,
    updateItemQuantity,
    removeItem,
    discount,
    note,
    setDiscount,
    removeDiscount,
    removeNote,
    updateItemSize,
    updateItemSugar,
    updateItemIce,
    updateItemExtraShot, // Fixed: use singular form as defined in use-cart
    removeItemExtraShot, // Added: this method exists in use-cart
    getCartSubtotal,
    getCartTotal,
    getDiscountAmount,
    calculateItemPrice,
    setPromotions,
    getPromotionDiscount,
    getAppliedPromotions,
  } = useCart();

  const [discountInput, setDiscountInput] = useState<string>("");
  const [onOpenDiscount, setOpenDiscount] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Set promotions when component mounts or promotions change
  useEffect(() => {
    setPromotions(promotions || null);
  }, [promotions, setPromotions]);

  // Get available sizes for a specific product
  const getProductSizes = (productId: string) => {
    return sizes?.filter((size) => size.productId === productId) || [];
  };

  // Get available sugars for a specific product
  const getProductSugars = (productId: string) => {
    return sugars?.filter((sugar) => sugar.productId === productId) || [];
  };

  // Get available ices for a specific product
  const getProductIces = (productId: string) => {
    return ices?.filter((ice) => ice.productId === productId) || [];
  };

  // Get available extra shots for a specific product
  const getProductExtraShots = (productId: string) => {
    return extraShots?.filter((shot) => shot.productId === productId) || [];
  };

  // Validate cart items for missing size or sugar selections
  const validateCartItems = () => {
    const itemsWithMissingInfo: string[] = [];

    items.forEach((item) => {
      const productSizes = getProductSizes(item.id);
      const productSugars = getProductSugars(item.id);
      const missingInfo: string[] = [];

      // Check if product has size options but no size selected
      if (
        productSizes.length > 0 &&
        (!item.size?.name || item.size.name.trim() === "")
      ) {
        missingInfo.push("size");
      }

      // Check if product has sugar options but no sugar level selected
      if (
        productSugars.length > 0 &&
        (!item.sugar || item.sugar.trim() === "")
      ) {
        missingInfo.push("sugar level");
      }

      if (missingInfo.length > 0) {
        itemsWithMissingInfo.push(`${item.name}: ${missingInfo.join(" and ")}`);
      }
    });

    if (itemsWithMissingInfo.length > 0) {
      toast.error(
        `Please select missing options for: ${itemsWithMissingInfo.join(", ")}`
      );
      return false;
    }

    return true;
  };

  // Use the cart's built-in calculation methods
  const subTotal = getCartSubtotal();
  const total = getCartTotal();
  const discountAmount = getDiscountAmount();
  const promotionDiscount = getPromotionDiscount();
  const appliedPromotions = getAppliedPromotions();

  const updateQuantity = useCallback(
    (cartItemId: string, delta: number) => {
      const item = items.find((item) => item.cartItemId === cartItemId);
      if (item) {
        const newQty = Math.max(1, item.quantity + delta);
        updateItemQuantity(cartItemId, newQty);
      }
    },
    [items, updateItemQuantity]
  );

  const applyDiscount = (type: "percent" | "amount") => {
    const inputValue = Number(discountInput);
    if (isNaN(inputValue) || inputValue < 0) {
      toast.error("Please enter a valid discount value");
      return;
    }

    if (type === "percent") {
      const percentValue = Math.min(100, Math.max(0, inputValue));
      setDiscount("percent", percentValue);
    } else {
      const amountValue = Math.min(subTotal, Math.max(0, inputValue));
      setDiscount("amount", amountValue);
    }
    setDiscountInput("");
    setOpenDiscount(false);
  };

  const handlePayNow = async () => {
    // Validate cart items before proceeding
    if (!validateCartItems()) {
      return;
    }

    try {
      setIsLoading(true);
      router.push("/dashboard/checkout");
    } catch (error) {
      console.error("Error during checkout:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle size change
  const handleSizeChange = (cartItemId: string, sizeId: string) => {
    const selectedSize = sizes?.find((size) => size.id === sizeId);
    if (selectedSize) {
      updateItemSize(
        cartItemId,
        sizeId,
        selectedSize.sizeName,
        Number(selectedSize.priceModifier)
      );
    }
  };

  // Handle sugar change
  const handleSugarChange = (cartItemId: string, sugarId: string) => {
    const selectedSugar = sugars?.find((sugar) => sugar.id === sugarId);
    if (selectedSugar) {
      updateItemSugar(cartItemId, selectedSugar.name, sugarId);
    }
  };

  // Handle ice change
  const handleIceChange = (cartItemId: string, iceId: string) => {
    const selectedIce = ices?.find((ice) => ice.id === iceId);
    if (selectedIce) {
      updateItemIce(cartItemId, selectedIce.name, iceId);
    }
  };

  // Handle extra shot change - Fixed to use the correct method from use-cart
  const handleExtraShot = (cartItemId: string, extraShotId: string) => {
    const item = items.find((item) => item.cartItemId === cartItemId);
    if (!item) return;

    const selectedExtraShot = extraShots?.find(
      (shot) => shot.id === extraShotId
    );
    if (!selectedExtraShot) return;

    // Check if this extra shot is already selected
    if (item.extraShotId === extraShotId) {
      // Remove the extra shot
      removeItemExtraShot(cartItemId);
      toast.info(`Removed ${selectedExtraShot.name}`);
    } else {
      // Add/Update the extra shot
      updateItemExtraShot(
        cartItemId,
        selectedExtraShot.id,
        selectedExtraShot.name,
        Number(selectedExtraShot.priceModifier)
      );
      toast.success(`Added ${selectedExtraShot.name}`);
    }
  };

  // Get display price for an item (including discounts)
  const getDisplayPrice = (item: CartItem) => {
    const basePrice = calculateItemPrice(item);
    const discount = Math.min(100, Math.max(0, Number(item.discount) || 0));
    return basePrice * (1 - discount / 100);
  };

  return (
    <div className="grid grid-rows-12 gap-2 h-full relative">
      {/* Disabled Overlay */}
      {disabled && (
        <div className="absolute inset-0 bg-gray-900/30 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg">
          <div className="bg-white p-6 rounded-lg shadow-xl text-center">
            <div className="text-gray-600 mb-2">
              <svg
                className="w-12 h-12 mx-auto mb-3 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                ></path>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Cart Disabled
            </h3>
            <p className="text-sm text-gray-600">Store is closed for today</p>
          </div>
        </div>
      )}

      <div className="md:row-span-7 row-span-8 flex flex-col">
        <div className="flex justify-between sticky top-0 z-10 ">
          <div></div>
          <h1 className="text-center font-bold ">
            Cart Detail {`(${items.length})`}
          </h1>
          {items.length > 0 ? (
            <Button
              onClick={() => {
                removeAll();
              }}
              variant={"destructive"}
              size={"icon"}
              disabled={disabled}
            >
              <Trash className="w-3 h-3" />
            </Button>
          ) : (
            <div></div>
          )}
        </div>
        <Separator className="my-2" />

        <div className="flex-grow overflow-y-auto space-y-1">
          {items.length > 0 ? (
            items.map((item) => (
              <Card
                key={item.cartItemId}
                className="grid grid-cols-1 gap-2 p-2 relative"
              >
                <div className="grid grid-cols-12 gap-2 items-center sm:p-3 p-1">
                  <div className="col-span-8 flex md:space-x-2 gap-2">
                    {/* Image Section */}
                    <div className="relative w-[60px] h-[60px] flex-shrink-0">
                      <Image
                        alt={item.name}
                        src={"/uploads/" + item.image}
                        fill
                        className="object-contain rounded"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                      {typeof item?.discount === "number" &&
                        item.discount > 0 && (
                          <Badge
                            className="absolute -top-2 -right-2 p-1 text-xs rounded-full"
                            variant={"destructive"}
                          >{`-${item.discount}%`}</Badge>
                        )}
                    </div>

                    {/* Product Details with Truncated Name */}
                    <div className="flex flex-col min-w-0 space-y-1">
                      <p className="sm:text-sm text-md truncate w-full text-[#4B3F2F]">
                        {item.name}
                      </p>
                      {item.discount ? (
                        <div className="flex lg:flex-row flex-col items-center space-x-1">
                          <p className="text-red-500 md:text-md text-sm font-bold">
                            {formatterUSD.format(getDisplayPrice(item))}
                          </p>
                          <del className="text-gray-400 md:text-md text-sm font-bold">
                            {formatterUSD.format(calculateItemPrice(item))}
                          </del>
                        </div>
                      ) : (
                        <p className="text-red-500 md:text-md text-sm font-bold">
                          {formatterUSD.format(calculateItemPrice(item))}
                        </p>
                      )}

                      {/* Display current selections */}
                      <div className="flex flex-wrap gap-1 text-xs text-gray-600">
                        {item.size?.name && (
                          <span className="bg-gray-100 px-2 py-1 rounded">
                            Size: {item.size.name}
                          </span>
                        )}
                        {item.sugar && (
                          <span className="bg-gray-100 px-2 py-1 rounded">
                            Sugar: {item.sugar}
                          </span>
                        )}
                        {item.ice && (
                          <span className="bg-gray-100 px-2 py-1 rounded">
                            Ice: {item.ice}
                          </span>
                        )}
                        {item.extraShot?.name && (
                          <span className="bg-gray-100 px-2 py-1 rounded">
                            Extra: {item.extraShot.name}
                          </span>
                        )}
                        {item.note && (
                          <span className="bg-blue-100 px-2 py-1 rounded text-blue-800">
                            Note: {item.note}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="col-span-4 flex justify-center">
                    <div className="flex border rounded-md space-x-3 p-2">
                      <span
                        className="cursor-pointer text-lg"
                        onClick={() => updateQuantity(item.cartItemId, -1)}
                      >
                        -
                      </span>
                      <span className="text-lg">{item.quantity}</span>
                      <span
                        className="cursor-pointer text-lg"
                        onClick={() => updateQuantity(item.cartItemId, 1)}
                      >
                        +
                      </span>
                    </div>
                    <div
                      onClick={() => {
                        removeItem(item.cartItemId);
                      }}
                      className="cursor-pointer absolute top-2 right-2"
                    >
                      <XCircleIcon className="w-4 h-4 text-red-500" />
                    </div>
                  </div>
                </div>

                {/* Options Selection Grid */}
                <div className="grid grid-cols-2 gap-2 px-2 pb-2">
                  {/* Size Selection */}
                  {getProductSizes(item.id).length > 0 && (
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-600">Size</Label>
                      <Select
                        value={item.sizeId || ""}
                        onValueChange={(value) =>
                          handleSizeChange(item.cartItemId, value)
                        }
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {getProductSizes(item.id).map((size) => (
                              <SelectItem value={size.id} key={size.id}>
                                <div className="flex justify-between items-center w-full">
                                  <span>{size.sizeName}</span>
                                  <span className="text-xs text-gray-500 ml-2">
                                    {Number(size.priceModifier) >= 0 ? "+" : ""}
                                    {formatterUSD.format(
                                      Number(size.priceModifier)
                                    )}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Sugar Selection */}
                  {getProductSugars(item.id).length > 0 && (
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-600">
                        Sugar Level
                      </Label>
                      <Select
                        value={item.sugarId || ""}
                        onValueChange={(value) =>
                          handleSugarChange(item.cartItemId, value)
                        }
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Select sugar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {getProductSugars(item.id).map((option) => (
                              <SelectItem value={option.id} key={option.id}>
                                {option.name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Ice Selection */}
                  {getProductIces(item.id).length > 0 && (
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-600">Ice Level</Label>
                      <Select
                        value={item.iceId || ""}
                        onValueChange={(value) =>
                          handleIceChange(item.cartItemId, value)
                        }
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Select ice" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {getProductIces(item.id).map((option) => (
                              <SelectItem value={option.id} key={option.id}>
                                {option.name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Extra Shots Selection - Fixed to handle single selection */}
                  {getProductExtraShots(item.id).length > 0 && (
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-600">
                        Extra Shot
                      </Label>
                      <div className="space-y-1">
                        {getProductExtraShots(item.id).map((shot) => {
                          const isSelected = item.extraShotId === shot.id;
                          return (
                            <Button
                              key={shot.id}
                              variant={isSelected ? "default" : "outline"}
                              size="sm"
                              className="w-full justify-between h-8 text-xs"
                              onClick={() =>
                                handleExtraShot(item.cartItemId, shot.id)
                              }
                            >
                              <span>{shot.name}</span>
                              <span className="text-xs">
                                +
                                {formatterUSD.format(
                                  Number(shot.priceModifier)
                                )}
                              </span>
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))
          ) : (
            <NoResult
              title="No item found"
              description="There is no item in cart. The item will be appeared when submitted"
            />
          )}
        </div>
      </div>

      {/* Summary Section */}
      <div className="md:row-span-5 row-span-4 h-full flex flex-col justify-between space-y-1">
        <div className="space-y-2">
          <Separator className="my-1" />
          <ul className="space-y-1">
            <li className="flex justify-between items-center p-2 rounded-sm border-t">
              <span className="font-semibold">Subtotal:</span>
              <span>{formatterUSD.format(subTotal)}</span>
            </li>
            {discount && (
              <li className="flex justify-between items-center p-2 rounded-sm border-t">
                <span className="font-semibold">Manual Discount:</span>
                <span className="flex items-center space-x-6">
                  <span>
                    -
                    {discount.type === "percent"
                      ? `${discount.value.toFixed(0)}%`
                      : formatterUSD.format(discount.value)}
                    {` (${formatterUSD.format(discountAmount)})`}
                  </span>
                  <span
                    className="cursor-pointer"
                    onClick={() => removeDiscount()}
                  >
                    <XCircleIcon className="text-foreground w-4 h-4" />
                  </span>
                </span>
              </li>
            )}
            {promotionDiscount > 0 && (
              <li className="flex justify-between items-center p-2 rounded-sm border-t bg-green-50 dark:bg-green-900/10">
                <span className="font-semibold text-green-700">
                  Promotion Discount:
                </span>
                <span className="text-green-700 font-semibold">
                  -{formatterUSD.format(promotionDiscount)}
                </span>
              </li>
            )}
            {appliedPromotions.length > 0 && (
              <li className="p-2 rounded-sm border-t bg-blue-50 dark:bg-blue-900/10">
                <span className="font-semibold text-blue-700 text-xs">
                  Applied Promotions:
                </span>
                <div className="space-y-1 mt-1">
                  {appliedPromotions.map((promo, index: number) => (
                    <div
                      key={index}
                      className="text-xs text-blue-600 flex justify-between"
                    >
                      <span>{promo.promotionName}</span>
                      <span>-{formatterUSD.format(promo.discountAmount)}</span>
                    </div>
                  ))}
                </div>
              </li>
            )}
            {note && (
              <li className="p-2 rounded-sm border-t w-full">
                <span className="flex justify-between items-center">
                  <span className="font-semibold flex-shrink-0">Note:</span>
                  <span className="cursor-pointer" onClick={() => removeNote()}>
                    <XCircleIcon className="text-foreground w-4 h-4" />
                  </span>
                </span>
                <div className="w-full line-clamp-1">{note}</div>
              </li>
            )}
          </ul>
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <DropdownMenu
              open={onOpenDiscount}
              onOpenChange={() => setOpenDiscount(!onOpenDiscount)}
            >
              <DropdownMenuTrigger asChild>
                <Button variant={"secondary"}>
                  {discount ? "Edit Discount" : "Add Discount"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 p-2 space-y-2 bg-background border rounded-lg shadow-md">
                <input
                  type="text"
                  value={discountInput}
                  readOnly
                  className="w-full text-xl font-bold text-center border-b pb-2 outline-none"
                />

                <div className="grid grid-cols-3 gap-2">
                  {[7, 8, 9, 4, 5, 6, 1, 2, 3, 0].map((num) => (
                    <Button
                      key={num}
                      variant={"outline"}
                      className="text-xl"
                      onClick={() => setDiscountInput((prev) => prev + num)}
                    >
                      {num}
                    </Button>
                  ))}
                  <Button
                    variant={"outline"}
                    onClick={() => {
                      if (!discountInput.includes(".")) {
                        setDiscountInput((prev) => prev + ".");
                      }
                    }}
                    className="text-xl"
                  >
                    .
                  </Button>
                  <Button
                    variant={"outline"}
                    onClick={() => setDiscountInput("")}
                  >
                    <XCircleIcon className="w-5 h-5" />
                  </Button>
                </div>

                <div className="flex justify-between mt-2">
                  <Button
                    className="w-1/2"
                    variant={"outline"}
                    onClick={() => applyDiscount("percent")}
                  >
                    % Discount
                  </Button>
                  <Button
                    className="w-1/2"
                    variant={"outline"}
                    onClick={() => applyDiscount("amount")}
                  >
                    $ Discount
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div>
            <Button
              disabled={items.length === 0 || disabled}
              variant={"default"}
              className="flex justify-between w-full py-6"
              onClick={handlePayNow}
            >
              {isLoading && <CgSpinnerTwoAlt className="animate-spin" />}
              {isLoading ? (
                "Loading..."
              ) : (
                <>
                  <span>Pay Now</span>
                  <span className="space-x-2 flex items-center">
                    <span>{formatterUSD.format(Number(total))}</span>
                    <ArrowRight />
                  </span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
