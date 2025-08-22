"use client";
import { Card } from "@/components/ui/card";
import React, { useState, useEffect } from "react";
import ProductCard from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, SortDescIcon, Lock, AlertTriangle } from "lucide-react";
import CartStore from "./CartStore";
import { useRouter } from "next/navigation";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Product, Size, Sugar, Ice, ExtraShot, Promotion } from "types";
import { Category } from "@prisma/client";
import NoResult from "@/components/NoResult";
import useCart from "@/hooks/use-cart";
import PromotionDisplay from "./PromotionDisplay";
import axios from "axios";
import { toast } from "sonner";

interface SaleProps {
  products: Product[] | null;
  categories: Category[] | null;
  sizes: Size[] | null;
  sugars?: Sugar[] | null;
  ices?: Ice[] | null;
  extraShots?: ExtraShot[] | null;
  promotions?: Promotion[] | null;
}
export default function Sale({
  products,
  categories,
  sizes,
  sugars,
  ices,
  extraShots,
  promotions,
}: SaleProps) {
  const [filteredProducts, setFilterdProducts] = useState<Product[] | null>(
    products
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [isDayClosed, setIsDayClosed] = useState<boolean>(false);
  const [isCheckingDayStatus, setIsCheckingDayStatus] = useState<boolean>(true);

  const cart = useCart();
  const [searchProducts, setSearchProducts] = useState("");
  const router = useRouter();

  // Check if day is already closed
  useEffect(() => {
    const checkDayStatus = async () => {
      try {
        const today = new Date().toISOString().split("T")[0];
        const response = await axios.get(`/api/day-close?date=${today}`);

        if (response.data) {
          setIsDayClosed(true);
          toast.error("Store is closed for today. POS system is disabled.");
        }
      } catch (error) {
        // If error, assume day is not closed (API might return 404 if no record)
        console.log("Day is not closed yet",error);
      } finally {
        setIsCheckingDayStatus(false);
      }
    };

    checkDayStatus();
  }, []);
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
    // Prevent adding items if day is closed
    if (isDayClosed) {
      toast.error("Cannot add items - Store is closed for today");
      return;
    }
    cart.addItem(product);
  };

  // Show loading state while checking day status
  if (isCheckingDayStatus) {
    return (
      <Card className="lg:col-span-7  md:col-span-5 md:h-[96vh] md:row-span-7 row-span-5 space-y-2 p-4 flex flex-col rounded-sm">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Checking store status...</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="lg:col-span-7  md:col-span-5 md:h-[96vh] md:row-span-7 row-span-5 space-y-2 p-4 flex flex-col rounded-sm relative">
        {/* Day Closed Overlay */}
        {isDayClosed && (
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center rounded-sm">
            <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-md mx-4">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <Lock className="w-8 h-8 text-red-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Store Closed
              </h2>
              <p className="text-gray-600 mb-4">
                The day has been closed and the POS system is disabled. No new
                orders can be processed.
              </p>
              <div className="flex items-center justify-center text-sm text-red-600 mb-4">
                <AlertTriangle className="w-4 h-4 mr-2" />
                All sales operations are locked
              </div>
              <Button
                onClick={() => router.push("/dashboard")}
                variant="outline"
                className="w-full"
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        )}

        {/* Promotion Display Section */}
        <PromotionDisplay promotions={promotions || null} />

        <div className=" flex justify-between static md:sticky md:top-0 z-10 gap-4">
          <Input
            value={searchProducts}
            onChange={onSearch}
            placeholder="Search product name..."
            disabled={isDayClosed}
          />
          <div className="flex items-center gap-2">
            <HoverCard>
              <DropdownMenu>
                <DropdownMenuTrigger asChild disabled={isDayClosed}>
                  <HoverCardTrigger asChild>
                    <Button
                      variant={"secondary"}
                      size={"icon"}
                      disabled={isDayClosed}
                    >
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
                  className={`${
                    isDayClosed
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  }`}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
      <Card className=" lg:col-span-5 md:col-span-7 md:h-[96vh] md:row-span-5 row-span-7 flex flex-col rounded-sm p-4">
        {/* Cart Section */}
        <CartStore
          sizes={sizes}
          sugars={sugars}
          ices={ices}
          extraShots={extraShots}
          promotions={promotions || null}
          disabled={isDayClosed}
        />
      </Card>
    </>
  );
}
