import NavbarPage from "@/components/Navbar/Navbar";
import React, { ReactNode } from "react";

function ShopLayout({ children }: { children: ReactNode }) {
  return (
    <div className="container mx-auto p-4 bg-white min-h-screen">
      <NavbarPage />
      <main>{children}</main>
    </div>
  );
}

export default ShopLayout;
