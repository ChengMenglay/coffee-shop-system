"use client";
import React from "react";

import Image from "next/image";
import { formatterUSD } from "@/lib/utils";
import useCart from "@/hooks/use-cart";
import { Product } from "types";
import { Badge } from "./ui/badge";

interface ProductCardProps {
  product: Product | null;
}
export default function ProductCard({ product }: ProductCardProps) {
  const cart = useCart();
  const onAddToCart = () => {
    cart.addItem(product as Product);
  };
  const calculateItemAfterDiscount = (item: Product) => {
    const discount = Math.min(100, Math.max(0, Number(item.discount) || 0));
    const priceAfterDiscount = Number(item.price) * (1 - discount / 100);
    return priceAfterDiscount;
  };
  return (
    <div
      onClick={onAddToCart}
      className=" cursor-pointer relative space-y-2 flex flex-col border dark:border-foreground p-2 shadow dark:shadow-foreground rounded-sm dark:bg-white"
    >
      <div className="aspect-square relative">
        <Image
          className="object-cover"
          alt={product?.name as string}
          src={("/uploads/" + product?.image) as string}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
      <div className="space-y-1 flex flex-col flex-1 justify-between">
        <h1 className="md:text-xs text-sm font-semibold dark:text-black truncate">
          {product?.name}
        </h1>
        {product?.discount && product?.discount ? (
          <div className="flex items-center space-x-1">
            <p className="text-red-500 md:text-md text-sm font-bold">
              {formatterUSD.format(Number(calculateItemAfterDiscount(product)))}
            </p>
            <del className="text-gray-400 md:text-md text-sm font-bold">
              {formatterUSD.format(Number(product.price))}
            </del>
          </div>
        ) : (
          <p className="text-red-500 md:text-md text-sm font-bold">
            {formatterUSD.format(Number(product?.price))}
          </p>
        )}
        {typeof product?.discount === "number" && product.discount > 0 && (
          <Badge
            className="absolute top-0 right-1 rounded-full text-xs font-semibold p-2"
            variant={"destructive"}
          >{`-${product.discount}%`}</Badge>
        )}
      </div>
    </div>
  );
}
