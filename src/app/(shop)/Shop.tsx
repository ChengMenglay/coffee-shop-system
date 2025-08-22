"use client";
import ProductCard from "@/components/ProductCard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Category, Product } from "types";
import { Lock, AlertTriangle, Clock } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
type ShopTypeProps = {
  categories: Category[];
  products: Product[];
};
function ShopComponent({ categories, products }: ShopTypeProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [filterProduct, setFilterProduct] = useState<Product[]>(products);
  const [isDayClosed, setIsDayClosed] = useState<boolean>(false);
  const [isCheckingDayStatus, setIsCheckingDayStatus] = useState<boolean>(true);
  const router = useRouter();

  // Check if day is already closed
  useEffect(() => {
    const checkDayStatus = async () => {
      try {
        const today = new Date().toISOString().split("T")[0];
        const response = await axios.get(`/api/day-close?date=${today}`);

        if (response.data) {
          setIsDayClosed(true);
          toast.error(
            "Store is closed for today. Online ordering is unavailable."
          );
        }
      } catch (error) {
        // If error, assume day is not closed (API might return 404 if no record)
        console.log("Day is not closed yet", error);
      } finally {
        setIsCheckingDayStatus(false);
      }
    };

    checkDayStatus();
  }, []);

  useEffect(() => {
    if (selectedCategory === "All") {
      setFilterProduct(products);
    } else {
      setFilterProduct(
        products.filter(
          (product) => product?.category?.name === selectedCategory
        )
      );
    }
  }, [selectedCategory, products]);

  const handleProductClick = (product: Product) => {
    // Prevent navigation if day is closed
    if (isDayClosed) {
      toast.error("Cannot view product - Store is closed for today");
      return;
    }
    router.push(`/shop/${product.id}`);
  };

  // Show loading state while checking day status
  if (isCheckingDayStatus) {
    return (
      <div className="my-6 flex flex-col items-center w-full min-h-[400px]">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Checking store status...</p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="my-6 flex flex-col items-center w-full relative">
      {/* Day Closed Overlay */}
      {isDayClosed && (
        <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center min-h-[600px]">
          <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-md mx-4">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <Clock className="w-10 h-10 text-red-600" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              We are Closed
            </h2>
            <p className="text-gray-600 mb-4">
              Sorry, our store is closed for today. Online ordering is currently
              unavailable.
            </p>
            <div className="flex items-center justify-center text-sm text-red-600 mb-6">
              <AlertTriangle className="w-4 h-4 mr-2" />
              All online services are temporarily disabled
            </div>
            <div className="text-sm text-gray-500 mb-4">
              <p>Store Hours: 7:00 AM - 9:00 PM</p>
              <p>Come back tomorrow for fresh coffee!</p>
            </div>
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="w-full"
            >
              <Lock className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      )}

      <div className="w-full overflow-x-auto">
        <Tabs
          value={selectedCategory}
          onValueChange={setSelectedCategory}
          className="mt-4 w-full min-w-max"
        >
          <TabsList className="flex w-max min-w-full">
            <TabsTrigger value={"All"} disabled={isDayClosed}>
              All
            </TabsTrigger>
            {categories.map((cat) => (
              <TabsTrigger key={cat.id} value={cat.name} disabled={isDayClosed}>
                {cat.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      <div className="w-full my-4 grid lg:grid-cols-5 md:grid-cols-4 grid-cols-3">
        {filterProduct.map((product) => (
          <div
            onClick={() => handleProductClick(product)}
            key={product.id}
            className={`${
              isDayClosed ? "opacity-30 cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default ShopComponent;
