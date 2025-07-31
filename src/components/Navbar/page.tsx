import { User } from "lucide-react";
import React from "react";

function NavbarPage() {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-xl font-bold">Coffee Shop</h1>
      <h1 className="text-lg font-bold">
        <User />
      </h1>
    </div>
  );
}

export default NavbarPage;
