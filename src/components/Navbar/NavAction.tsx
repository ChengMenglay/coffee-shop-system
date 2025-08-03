"use client";
import { Button } from "../ui/button";
import { ShoppingCart } from "lucide-react";
import useCart from "@/hooks/use-cart";
import useSheet from "@/hooks/use-sheet";
import CartSheet from "@/app/(shop)/shop/[productId]/components/CartSheet";

function NavAction() {
  const cart = useCart();
  const { onOpen } = useSheet();
  const handleOpenSheet = () => {
    onOpen();
  };
  return (
    <div>
      <CartSheet />
      <Button variant={"outline"} onClick={handleOpenSheet}>
        <ShoppingCart size={18} />
        <span>{cart.items.length}</span>
      </Button>
    </div>
  );
}

export default NavAction;
