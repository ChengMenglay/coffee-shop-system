"use client";
import ProductCard from "@/components/ProductCard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Category, Product } from "types";
type ShopTypeProps = {
  categories: Category[];
  products: Product[];
};
function ShopComponent({ categories, products }: ShopTypeProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [filterProduct, setFilterProduct] = useState<Product[]>(products);
  const router = useRouter();
  useEffect(() => {
    if (selectedCategory === "All") {
      setFilterProduct(products);
    } else {
      setFilterProduct(
        products.filter((product) => product?.category?.name === selectedCategory)
      );
    }
  }, [selectedCategory, products]);
  return (
    <div className="my-6 flex flex-col items-center w-full">
      <div className="w-full overflow-x-auto">
        <Tabs
          value={selectedCategory}
          onValueChange={setSelectedCategory}
          className="mt-4 w-full min-w-max"
        >
          <TabsList className="flex w-max min-w-full">
            <TabsTrigger value={"All"}>All</TabsTrigger>
            {categories.map((cat) => (
              <TabsTrigger key={cat.id} value={cat.name}>
                {cat.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      <div className="w-full my-4 grid lg:grid-cols-5 md:grid-cols-4 grid-cols-3">
        {filterProduct.map((product) => (
          <div
            onClick={() => router.push(`/shop/${product.id}`)}
            key={product.id}
            className="cursor-pointer"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default ShopComponent;
