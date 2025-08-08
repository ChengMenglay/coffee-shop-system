"use client";
import { Card } from "@/components/ui/card";
import React, { useState } from "react";
import ProductCard from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, SortDescIcon } from "lucide-react";
import CartStore from "./CartStore";
import { useRouter } from "next/navigation";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Product, Size, Sugar,Ice,ExtraShot } from "types";
import { Category } from "@prisma/client";
import NoResult from "@/components/NoResult";
import useCart from "@/hooks/use-cart";

interface SaleProps {
  products: Product[] | null;
  categories: Category[] | null;
  sizes: Size[] | null;
  sugars?: Sugar[] | null;
  ices?: Ice[] | null;
  extraShots?: ExtraShot[] | null;
}
export default function Sale({ products, categories, sizes, sugars, ices, extraShots }: SaleProps) {
  const [filteredProducts, setFilterdProducts] = useState<Product[] | null>(
    products
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const cart = useCart();
  const [searchProducts, setSearchProducts] = useState("");
  const router = useRouter();
  const onSort = (id: string | null) => {
    setSelectedCategoryId(id);
    ProductFilter(searchProducts, id);
  };
  const onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchProducts(term);
    ProductFilter(term, selectedCategoryId);
  };
  const ProductFilter = (term: string, categoryId: string | null) => {
    if (!products) return;

    let filterdProducts = products;

    if (categoryId !== null) {
      filterdProducts = filterdProducts.filter(
        (product) => product.categoryId === categoryId
      );
    }

    if (term) {
      filterdProducts = filterdProducts.filter((item) =>
        item.name.toLowerCase().includes(term)
      );
    }

    setFilterdProducts(filterdProducts);
  };
  const handleProductClick = (product: Product) => {
    cart.addItem(product);
  };
  return (
    <>
      <Card className="lg:col-span-7  md:col-span-5 md:h-[80vh] md:row-span-7 row-span-5 space-y-2 p-4 flex flex-col rounded-sm">
        <div className=" flex justify-between static md:sticky md:top-0 z-10 gap-4">
          <Input
            value={searchProducts}
            onChange={onSearch}
            placeholder="Search product name..."
          />
          <div className="flex items-center gap-2">
            <HoverCard>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <HoverCardTrigger asChild>
                    <Button variant={"secondary"} size={"icon"}>
                      <SortDescIcon />
                    </Button>
                  </HoverCardTrigger>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => onSort(null)}>
                    All
                  </DropdownMenuItem>
                  {categories?.map((category) => (
                    <DropdownMenuItem
                      key={category.id}
                      onClick={() => onSort(category.id)}
                    >
                      {category.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <HoverCardContent className="p-2 shadow-none border-[1px] border-foreground w-28">
                <h1 className="text-xs text-center">Sort Items</h1>
              </HoverCardContent>
            </HoverCard>
            <HoverCard>
              <HoverCardTrigger asChild>
                <Button
                  onClick={() => router.push("/dashboard/product/new")}
                  size={"icon"}
                  variant={"secondary"}
                >
                  <Plus />
                </Button>
              </HoverCardTrigger>
              <HoverCardContent className="p-2 shadow-none border-[1px] border-foreground w-28">
                <h1 className="text-xs text-center">Add new item</h1>
              </HoverCardContent>
            </HoverCard>
          </div>
        </div>
        <div className="overflow-y-auto flex-grow mt-2">
          {filteredProducts?.length === 0 ? (
            <NoResult
              title="No Product Found"
              description="There is no product found, prodouct will be appeared when it available."
            />
          ) : (
            <div className=" grid lg:grid-cols-5 md:grid-cols-2 sm:grid-cols-4 grid-cols-3 gap-2 ">
              {filteredProducts?.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleProductClick(product)}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
      <Card className=" lg:col-span-5 md:col-span-7 md:h-[80vh] md:row-span-5 row-span-7 flex flex-col rounded-sm p-4">
        <CartStore sizes={sizes} sugars={sugars} ices={ices} extraShots={extraShots} />
      </Card>
    </>
  );
}
