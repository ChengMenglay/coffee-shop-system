"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import useCart, { CartItem } from "@/hooks/use-cart";
import { formatterUSD } from "@/lib/utils";
import { ArrowRight, Trash, XCircleIcon } from "lucide-react";
import Image from "next/image";
import React, { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { CgSpinnerTwoAlt } from "react-icons/cg";
import NoResult from "@/components/NoResult";
import { Size } from "types";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type CardStoreProps = {
  sizes: Size[] | null;
};

const SUGAR_OPTIONS = [
  { value: "0", label: "No Sugar" },
  { value: "25", label: "25% Sugar" },
  { value: "50", label: "50% Sugar" },
  { value: "75", label: "75% Sugar" },
  { value: "100", label: "100% Sugar" },
];

export default function CartStore({ sizes }: CardStoreProps) {
  const {
    items,
    removeAll,
    updateItemQuantity,
    removeItem,
    discount,
    note,
    setDiscount,
    setNote,
    removeDiscount,
    removeNote,
    updateItemSize,
    updateItemSugar,
  } = useCart();
  const [discountInput, setDiscountInput] = useState<string>("");
  const [noteInput, setNoteInput] = useState<string>("");
  const [onOpenDiscount, setOpenDiscount] = useState<boolean>(false);
  const [onOpenNote, setOpenNote] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Get available sizes for a specific product
  const getProductSizes = (productId: string) => {
    return sizes?.filter((size) => size.productId === productId) || [];
  };

  // Validate cart items for missing size or sugar selections
  const validateCartItems = () => {
    const itemsWithMissingInfo: string[] = [];

    items.forEach((item) => {
      const productSizes = getProductSizes(item.id);
      const missingInfo: string[] = [];

      // Check if product has size options but no size selected
      if (productSizes.length > 0 && (!item.size || item.size.trim() === "")) {
        missingInfo.push("size");
      }

      // Check if no sugar level selected
      if (!item.sugar || item.sugar.trim() === "") {
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

  const subTotal = useMemo(
    () =>
      items.reduce((acc, item) => {
        // Get the selected size to calculate price with modifier
        const selectedSize = getProductSizes(item.id).find(
          (size) => size.sizeName === item.size
        );
        const basePrice = selectedSize
          ? Number(selectedSize.fullPrice)
          : Number(item.price);

        const discount = Math.min(100, Math.max(0, Number(item.discount) || 0));
        const priceAfterDiscount = basePrice * (1 - discount / 100);
        return acc + priceAfterDiscount * Number(item.quantity);
      }, 0),
    [getProductSizes, items]
  );

  const total = useMemo(() => {
    const currentDiscount = discount?.value || 0;

    if (discount?.type === "percent") {
      const discountValue = subTotal * currentDiscount;
      return subTotal - discountValue;
    } else if (discount?.type === "amount") {
      return Math.max(0, subTotal - currentDiscount);
    }
    return subTotal;
  }, [subTotal, discount?.value, discount?.type]);

  const updateQuantity = useCallback(
    (id: string, delta: number) => {
      const item = items.find((item) => item.id === id);
      if (item) {
        const newQty = Math.max(1, item.quantity + delta);
        updateItemQuantity(id, newQty);
      }
    },
    [items, updateItemQuantity]
  );

  const applyDiscount = (type: "percent" | "amount") => {
    if (type === "percent") {
      const percentValue =
        Math.min(100, Math.max(0, Number(discountInput))) / 100;
      setDiscount("percent", percentValue);
    } else {
      const amountValue = Math.min(
        subTotal,
        Math.max(0, Number(discountInput))
      );
      setDiscount("amount", amountValue);
    }
    setDiscountInput("");
    setOpenDiscount(false);
  };

  const calculateItemAfterDiscount = (item: CartItem) => {
    // Get the selected size to use the correct price
    const selectedSize = getProductSizes(item.id).find(
      (size) => size.sizeName === item.size
    );
    const basePrice = selectedSize
      ? Number(selectedSize.fullPrice)
      : Number(item.price);

    const discount = Math.min(100, Math.max(0, Number(item.discount) || 0));
    const priceAfterDiscount = basePrice * (1 - discount / 100);
    return priceAfterDiscount;
  };

  // Get the current price for an item (including size modifier)
  const getCurrentItemPrice = (item: CartItem) => {
    const selectedSize = getProductSizes(item.id).find(
      (size) => size.sizeName === item.size
    );
    return selectedSize ? Number(selectedSize.fullPrice) : Number(item.price);
  };

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedNote = noteInput.trim();

    if (trimmedNote) {
      setNote(trimmedNote);
      setOpenNote(false);
      setNoteInput("");
    } else {
      toast.warning("Please enter a valid note");
    }
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
  const handleSizeChange = (itemId: string, sizeId: string) => {
    const selectedSize = sizes?.find((size) => size.id === sizeId);
    if (selectedSize) {
      updateItemSize(itemId, sizeId, selectedSize.sizeName);
    }
  };

  // Handle sugar change
  const handleSugarChange = (itemId: string, sugarValue: string) => {
    updateItemSugar(itemId, sugarValue);
  };
  return (
    <div className="grid grid-rows-12 gap-2 h-full">
      <div className="row-span-8 flex flex-col">
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
            >
              <Trash className="w-3 h-3" />
            </Button>
          ) : (
            <div></div>
          )}
        </div>
        <Separator className="my-2" />

        <div className="flex-grow overflow-y-auto  space-y-1">
          {items.length > 0 ? (
            items.map((item) => (
              <Card
                key={item.id}
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
                      {typeof item?.discount === "number" && item.discount > 0 && (
                        <Badge
                          className="absolute -top-2 -right-2 p-1  text-xs rounded-full"
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
                            {formatterUSD.format(
                              Number(calculateItemAfterDiscount(item))
                            )}
                          </p>
                          <del className="text-gray-400 md:text-md text-sm font-bold">
                            {formatterUSD.format(getCurrentItemPrice(item))}
                          </del>
                        </div>
                      ) : (
                        <p className="text-red-500 md:text-md text-sm font-bold">
                          {formatterUSD.format(getCurrentItemPrice(item))}
                        </p>
                      )}

                      {/* Display current size and sugar with price info */}
                      <div className="flex flex-wrap gap-1 text-xs text-gray-600">
                        {item.size && (
                          <span className="bg-gray-100 px-2 py-1 rounded">
                            Size: {item.size}
                          </span>
                        )}
                        {item.sugar && (
                          <span className="bg-gray-100 px-2 py-1 rounded">
                            Sugar: {item.sugar}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="col-span-4 flex justify-center">
                    <div className="flex border rounded-md space-x-3 p-2">
                      <span
                        className="cursor-pointer text-lg"
                        onClick={() => updateQuantity(item.id, -1)}
                      >
                        -
                      </span>
                      <span className="text-lg">{item.quantity}</span>
                      <span
                        className="cursor-pointer text-lg"
                        onClick={() => updateQuantity(item.id, 1)}
                      >
                        +
                      </span>
                    </div>
                    <div
                      onClick={() => {
                        removeItem(item.id);
                      }}
                      className="cursor-pointer absolute top-2 right-2"
                    >
                      <XCircleIcon className="w-4 h-4 text-red-500" />
                    </div>
                  </div>
                </div>

                {/* Size and Sugar Selection Row */}
                <div className="grid grid-cols-2 gap-2 px-2 pb-2">
                  {/* Size Selection */}
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-600">Size</Label>
                    <Select
                      value={
                        getProductSizes(item.id).find(
                          (size) => size.sizeName === item.size
                        )?.id || ""
                      }
                      onValueChange={(value) =>
                        handleSizeChange(item.id, value)
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
                                  {formatterUSD.format(Number(size.fullPrice))}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sugar Selection */}
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-600">Sugar Level</Label>
                    <Select
                      value={item.sugar}
                      onValueChange={(value) =>
                        handleSugarChange(item.id, value)
                      }
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select sugar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {SUGAR_OPTIONS.map((option) => (
                            <SelectItem value={option.value} key={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
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

      <div className="row-span-4 h-full flex flex-col justify-between space-y-1">
        <div className="space-y-2 ">
          <Separator className="my-1" />
          <ul className="space-y-1">
            <li className="flex justify-between items-center p-2 rounded-sm border-t">
              <span className="font-semibold ">Subtotal:</span>
              <span>{formatterUSD.format(subTotal)}</span>
            </li>
            {discount?.value !== undefined && (
              <li className="flex justify-between items-center p-2 rounded-sm border-t">
                <span className="font-semibold">Discount:</span>
                <span className="flex items-center space-x-6">
                  <span>
                    {discount.type === "percent"
                      ? `${(Number(discount?.value) * 100).toFixed(0)}%`
                      : formatterUSD.format(Number(discount?.value))}
                  </span>{" "}
                  <span
                    className=" cursor-pointer"
                    onClick={() => removeDiscount()}
                  >
                    <XCircleIcon className="text-foreground w-4 h-4" />
                  </span>
                </span>
              </li>
            )}
            {note && (
              <li className="p-2 rounded-sm border-t w-full">
                <span className="flex justify-between items-center">
                  <span className="font-semibold flex-shrink-0">Note:</span>
                  <span
                    className=" cursor-pointer"
                    onClick={() => removeNote()}
                  >
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

            <DropdownMenu
              open={onOpenNote}
              onOpenChange={() => setOpenNote(!onOpenNote)}
            >
              <DropdownMenuTrigger asChild>
                <Button variant={"secondary"}>
                  {note ? "Edit Note" : "Add Note"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-64 p-2 space-y-2 bg-background border rounded-lg shadow-md"
              >
                <form onSubmit={handleCreateNote} className="space-y-4">
                  <div className="space-y-1">
                    <Label>Note</Label>
                    <Input
                      type="text"
                      value={noteInput}
                      onChange={(e) => setNoteInput(e.target.value)}
                      placeholder="Write your note here..."
                    />
                  </div>
                  <Button type="submit" variant={"outline"} className="w-full">
                    {note ? "Update Note" : "Add Note"}
                  </Button>
                  {note && (
                    <Button
                      type="button"
                      variant={"destructive"}
                      className="w-full"
                      onClick={() => {
                        setNoteInput("");
                        setNote("");
                        setOpenNote(false);
                        toast.info("Note removed");
                      }}
                    >
                      Remove Note
                    </Button>
                  )}
                </form>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div>
            <Button
              disabled={items.length === 0}
              variant={"default"}
              className="flex justify-between w-full py-6"
              onClick={handlePayNow}
            >
              {isLoading && <CgSpinnerTwoAlt className=" animate-spin" />}
              {isLoading ? (
                "Loading..."
              ) : (
                <>
                  <span>Pay Now</span>
                  <span className=" space-x-2 flex items-center">
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
