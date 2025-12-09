"use client";
import useCart from "@/hooks/use-cart";
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatterUSD } from "@/lib/utils";
import { Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";

function CartItems() {
  const {
    items,
    updateItemQuantity,
    removeItem,
    calculateItemPriceWithProductDiscount,
    calculateItemPrice,
  } = useCart();
  return (
    <div className="space-y-4">
      {/* Cart Items */}
      <div className="space-y-3">
        {items.map((item) => {
          const basePrice = calculateItemPrice(item);
          const discountedPrice = calculateItemPriceWithProductDiscount(item);
          const hasProductDiscount =
            typeof item?.discount === "number" &&
            item.discount &&
            item.discount > 0;
          const itemTotal = discountedPrice * item.quantity;

          return (
            <Card
              key={item.cartItemId}
              className="overflow-hidden hover:shadow-md transition-shadow"
            >
              <CardContent className="px-4 py-2">
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div className="relative w-20 h-20 flex-shrink-0">
                    <Image
                      src={
                        `${item.image}` || "/placeholder-product.jpg"
                      }
                      alt={item.name}
                      fill
                      className="object-cover rounded-lg"
                      sizes="80px"
                    />
                    {hasProductDiscount && (
                      <div className="absolute -top-2 -right-2">
                        <Badge className="bg-red-500 text-white text-xs px-1.5 py-0.5">
                          {item.discount}% OFF
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 truncate">
                          {item.name}
                        </h3>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.cartItemId)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Customizations */}
                    {(item.size ||
                      item.sugar ||
                      item.ice ||
                      item.extraShot ||
                      item.note) && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {item.size && (
                          <Badge variant="outline" className="text-xs">
                            Size: {item.size.name}
                          </Badge>
                        )}
                        {item.sugar && (
                          <Badge variant="outline" className="text-xs">
                            Sugar: {item.sugar}
                          </Badge>
                        )}
                        {item.ice && (
                          <Badge variant="outline" className="text-xs">
                            Ice: {item.ice}
                          </Badge>
                        )}
                        {item.extraShot && (
                          <Badge variant="outline" className="text-xs">
                            +{item.extraShot.name}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Special Note */}
                    {item.note && (
                      <div className="mb-3">
                        <p className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                          <span className="font-medium">Note:</span> {item.note}
                        </p>
                      </div>
                    )}

                    {/* Price and Quantity Controls */}
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg text-green-600">
                            {formatterUSD.format(itemTotal)}
                          </span>
                          {hasProductDiscount ? (
                            <span className="text-sm text-gray-500 line-through">
                              {formatterUSD.format(basePrice * item.quantity)}
                            </span>
                          ) : null}
                        </div>
                        {hasProductDiscount ? (
                          <div className="text-sm text-gray-600">
                            {formatterUSD.format(discountedPrice)} each
                            <span className="text-green-600 ml-1">
                              (Save{" "}
                              {formatterUSD.format(
                                (basePrice - discountedPrice) * item.quantity
                              )}
                              )
                            </span>
                          </div>
                        ) : null}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateItemQuantity(
                              item.cartItemId,
                              Math.max(0, item.quantity - 1)
                            )
                          }
                          className="w-8 h-8 p-0"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>

                        <div className="w-12 text-center">
                          <span className="font-medium text-lg">
                            {item.quantity}
                          </span>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateItemQuantity(
                              item.cartItemId,
                              item.quantity + 1
                            )
                          }
                          className="w-8 h-8 p-0"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default CartItems;
