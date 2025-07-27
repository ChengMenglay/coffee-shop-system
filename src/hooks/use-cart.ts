import { toast } from "sonner";
import { Product } from "types";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface CartItem extends Product {
  quantity: number;
  size?: string; // Size name
  sizeId?: string; // Size ID for reference
  sugar?: string; // '0' | '25' | '50' | '75' | '100'
}

interface CardStore {
  items: CartItem[];
  discount?: {
    type: "percent" | "amount";
    value: number;
  };
  note?: string;
  addItem: (data: Product, defaultSizeId?: string) => void;
  updateItemQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  removeAllItem: () => void;
  removeAll: () => void;
  setDiscount: (type: "percent" | "amount", value: number) => void;
  setNote: (value: string) => void;
  removeDiscount: () => void;
  removeNote: () => void;
  updateItemSize: (id: string, sizeId: string, sizeName: string) => void;
  updateItemSugar: (id: string, sugar: string) => void;
}

const useCart = create(
  persist<CardStore>(
    (set, get) => ({
      items: [],
      discount: undefined,
      note: undefined,
      addItem: (data: Product, defaultSizeId?: string) => {
        set((state) => {
          const existingItem = state.items.find((item) => item.id === data.id);
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.id === data.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                ...data,
                quantity: 1,
                sugar: undefined,
                size: undefined,
              },
            ],
          };
        });
        toast.success("Item added to cart");
      },
      updateItemQuantity: (id: string, quantity: number) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        }));
      },
      removeItem: (id: string) => {
        set({ items: get().items.filter((item) => item.id !== id) });
        toast.info("Item removed from cart");
      },
      removeAllItem: () => {
        set({ items: [] });
        toast.info("All items removed from cart");
      },
      removeAll: () => {
        set({ items: [], discount: undefined, note: undefined });
      },
      setDiscount: (type, value) => {
        set({ discount: { type, value } });
        toast.success(
          `${type === "percent" ? "Percentage" : "Amount"} discount applied`
        );
      },
      setNote: (value) => {
        set({ note: value });
        toast.success("Note added to order");
      },
      removeDiscount: () => {
        set({ discount: undefined });
        toast.info("Discount removed");
      },
      removeNote: () => {
        set({ note: undefined });
        toast.info("Note removed");
      },
      updateItemSize: (id: string, sizeId: string, sizeName: string) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, size: sizeName, sizeId: sizeId } : item
          ),
        }));
        const sizeLabel = sizeName.charAt(0).toUpperCase() + sizeName.slice(1);
        toast.success(`Size updated to ${sizeLabel}`);
      },
      updateItemSugar: (id: string, sugar: string) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, sugar } : item
          ),
        }));
        toast.success(`Sugar level updated to ${sugar}%`);
      },
    }),
    {
      name: "cart-order-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useCart;
