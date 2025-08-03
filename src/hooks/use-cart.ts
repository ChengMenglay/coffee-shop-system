import { toast } from "sonner";
import { Product } from "types";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface CartItem extends Product {
  cartItemId: string;
  quantity: number;
  size?: { name: string; priceModifier: number };
  sizeId?: string;
  sugar?: string;
  sugarId?: string;
  ice?: string;
  iceId?: string;
  extraShotId?: string;
  extraShot?: { name: string; priceModifier: number };
  note?: string;
  calculatedPrice?: number;
  basePrice?: number; // Base price before product discount
  discountedPrice?: number; // Price after product discount
}

interface CartStore {
  items: CartItem[];
  discount?: {
    type: "percent" | "amount";
    value: number;
  };
  note?: string;
  addItem: (data: Product, options?: {
    defaultSizeId?: string;
    defaultSizeName?: string;
    defaultSizeModifier?: number;
    sugar?: string;
    sugarId?: string;
    ice?: string;
    iceId?: string;
    extraShotId?: string;
    extraShotName?: string;
    extraShotModifier?: number;
    note?: string;
  }) => void;
  updateItemQuantity: (cartItemId: string, quantity: number) => void;
  removeItem: (cartItemId: string) => void;
  removeAllItems: () => void;
  removeAll: () => void;
  setDiscount: (type: "percent" | "amount", value: number) => void;
  setNote: (value: string) => void;
  removeDiscount: () => void;
  removeNote: () => void;
  updateItemSize: (cartItemId: string, sizeId: string, sizeName: string, priceModifier?: number) => void;
  updateItemSugar: (cartItemId: string, sugar: string, sugarId?: string) => void;
  updateItemIce: (cartItemId: string, ice: string, iceId?: string) => void;
  updateItemExtraShot: (cartItemId: string, extraShotId: string, extraShotName: string, priceModifier: number) => void;
  removeItemExtraShot: (cartItemId: string) => void;
  updateItemNote: (cartItemId: string, note: string) => void;
  calculateItemPrice: (item: CartItem) => number;
  calculateItemPriceWithProductDiscount: (item: CartItem) => number;
  getCartTotal: () => number;
  getCartSubtotal: () => number;
  getCartSubtotalWithProductDiscounts: () => number;
  getDiscountAmount: () => number;
  getTotalProductDiscounts: () => number;
}

// Helper function to generate unique cart item ID
const generateCartItemId = () => `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Helper function to create cart item key for comparison
const createItemKey = (productId: string, sizeId?: string, sugarId?: string, iceId?: string, extraShotId?: string, note?: string) => {
  return `${productId}_${sizeId || ''}_${sugarId || ''}_${iceId || ''}_${extraShotId || ''}_${note || ''}`;
};

const useCart = create(
  persist<CartStore>(
    (set, get) => ({
      items: [],
      discount: undefined,
      note: undefined,

      // Calculate base price with modifiers (before product discount)
      calculateItemPrice: (item: CartItem) => {
        let price = Number(item.price);
        
        // Add size modifier if applicable
        if (item.size?.priceModifier) {
          price += Number(item.size.priceModifier);
        }
        
        // Add extra shot modifier if applicable
        if (item.extraShot?.priceModifier) {
          price += Number(item.extraShot.priceModifier);
        }
        
        return price;
      },

      // Calculate final price with product discount applied
      calculateItemPriceWithProductDiscount: (item: CartItem) => {
        const { calculateItemPrice } = get();
        const basePrice = calculateItemPrice(item);
        
        // Apply product discount if it exists
       // In CartStore.tsx - potential undefined access
const productDiscount = Math.min(100, Math.max(0, Number(item.discount) || 0));
        if (productDiscount > 0) {
          const discountAmount = basePrice * (Math.min(100, Math.max(0, productDiscount)) / 100);
          return basePrice - discountAmount;
        }
        
        return basePrice;
      },

      // Get subtotal before product discounts (for display purposes)
getCartSubtotal: () => {
  const { items, calculateItemPriceWithProductDiscount } = get();
  return items.reduce((total, item) => {
    return total + (calculateItemPriceWithProductDiscount(item) * item.quantity);
  }, 0);
},

      // Get subtotal after product discounts are applied
      getCartSubtotalWithProductDiscounts: () => {
        const { items, calculateItemPriceWithProductDiscount } = get();
        return items.reduce((total, item) => {
          return total + (calculateItemPriceWithProductDiscount(item) * item.quantity);
        }, 0);
      },

      // Get total product discounts amount
      getTotalProductDiscounts: () => {
        const { getCartSubtotal, getCartSubtotalWithProductDiscounts } = get();
        return getCartSubtotal() - getCartSubtotalWithProductDiscounts();
      },

      // Get cart-level discount amount (applied after product discounts)
      getDiscountAmount: () => {
        const { discount, getCartSubtotalWithProductDiscounts } = get();
        if (!discount) return 0;
        
        const subtotalAfterProductDiscounts = getCartSubtotalWithProductDiscounts();
        if (discount.type === "percent") {
          return subtotalAfterProductDiscounts * (discount.value / 100);
        }
        return discount.value;
      },

      // Get final cart total (subtotal - product discounts - cart discount)
      getCartTotal: () => {
        const { getCartSubtotalWithProductDiscounts, getDiscountAmount } = get();
        return Math.max(0, getCartSubtotalWithProductDiscounts() - getDiscountAmount());
      },

      addItem: (data: Product, options = {}) => {
        set((state) => {
          const { calculateItemPrice, calculateItemPriceWithProductDiscount } = get();
          
          // Create item key for uniqueness check
          const itemKey = createItemKey(
            data.id,
            options.defaultSizeId,
            options.sugarId,
            options.iceId,
            options.extraShotId,
            options.note
          );
          
          // Find existing item with same customizations
          const existingItemIndex = state.items.findIndex((item) => {
            const existingItemKey = createItemKey(
              item.id,
              item.sizeId,
              item.sugarId,
              item.iceId,
              item.extraShotId,
              item.note
            );
            return existingItemKey === itemKey;
          });

          if (existingItemIndex !== -1) {
            // Update quantity of existing item
            const updatedItems = [...state.items];
            updatedItems[existingItemIndex] = {
              ...updatedItems[existingItemIndex],
              quantity: updatedItems[existingItemIndex].quantity + 1
            };
            return { items: updatedItems };
          }

          // Create new cart item
          const newCartItem: CartItem = {
            ...data,
            cartItemId: generateCartItemId(),
            quantity: 1,
            sizeId: options.defaultSizeId,
            size: options.defaultSizeName && options.defaultSizeModifier !== undefined 
              ? { name: options.defaultSizeName, priceModifier: options.defaultSizeModifier }
              : undefined,
            sugar: options.sugar,
            sugarId: options.sugarId,
            ice: options.ice,
            iceId: options.iceId,
            extraShotId: options.extraShotId,
            extraShot: options.extraShotName && options.extraShotModifier !== undefined
              ? { name: options.extraShotName, priceModifier: options.extraShotModifier }
              : undefined,
            note: options.note,
          };

          // Calculate prices
          newCartItem.basePrice = calculateItemPrice(newCartItem);
          newCartItem.discountedPrice = calculateItemPriceWithProductDiscount(newCartItem);
          newCartItem.calculatedPrice = newCartItem.discountedPrice;

          return {
            items: [...state.items, newCartItem],
          };
        });
        
        // Show appropriate toast message
        const productDiscount = Number(data.discount) || 0;
        if (productDiscount > 0) {
          toast.success(`Item added with ${productDiscount}% discount!`);
        } else {
          toast.success("Item added to cart");
        }
      },

      updateItemQuantity: (cartItemId: string, quantity: number) => {
        if (quantity < 0) {
          toast.error("Quantity cannot be negative");
          return;
        }
        
        if (quantity === 0) {
          get().removeItem(cartItemId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.cartItemId === cartItemId ? { ...item, quantity } : item
          ),
        }));
      },

      removeItem: (cartItemId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.cartItemId !== cartItemId)
        }));
        toast.info("Item removed from cart");
      },

      removeAllItems: () => {
        set({ items: [] });
        toast.info("All items removed from cart");
      },

      removeAll: () => {
        set({ items: [], discount: undefined, note: undefined });
      },

      setDiscount: (type, value) => {
        if (value < 0) {
          toast.error("Discount value cannot be negative");
          return;
        }
        
        if (type === "percent" && value > 100) {
          toast.error("Percentage discount cannot exceed 100%");
          return;
        }

        set({ discount: { type, value } });
        toast.success(
          `${type === "percent" ? "Percentage" : "Amount"} cart discount applied`
        );
      },

      setNote: (value) => {
        set({ note: value });
        toast.success("Note added to order");
      },

      removeDiscount: () => {
        set({ discount: undefined });
        toast.info("Cart discount removed");
      },

      removeNote: () => {
        set({ note: undefined });
        toast.info("Note removed");
      },

      updateItemSize: (cartItemId: string, sizeId: string, sizeName: string, priceModifier = 0) => {
        set((state) => {
          const { calculateItemPrice, calculateItemPriceWithProductDiscount } = get();
          const updatedItems = state.items.map((item) => {
            if (item.cartItemId === cartItemId) {
              const updatedItem = { 
                ...item, 
                sizeId: sizeId,
                size: { name: sizeName, priceModifier: Number(priceModifier) }
              };
              // Recalculate prices
              updatedItem.basePrice = calculateItemPrice(updatedItem);
              updatedItem.discountedPrice = calculateItemPriceWithProductDiscount(updatedItem);
              updatedItem.calculatedPrice = updatedItem.discountedPrice;
              return updatedItem;
            }
            return item;
          });
          return { items: updatedItems };
        });
      },

      updateItemSugar: (cartItemId: string, sugar: string, sugarId?: string) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.cartItemId === cartItemId ? { ...item, sugar, sugarId } : item
          ),
        }));
        toast.success(`Sugar level updated to ${sugar}`);
      },

      updateItemIce: (cartItemId: string, ice: string, iceId?: string) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.cartItemId === cartItemId ? { ...item, ice, iceId } : item
          ),
        }));
      },

      updateItemExtraShot: (cartItemId: string, extraShotId: string, extraShotName: string, priceModifier: number) => {
        set((state) => {
          const { calculateItemPrice, calculateItemPriceWithProductDiscount } = get();
          const updatedItems = state.items.map((item) => {
            if (item.cartItemId === cartItemId) {
              const updatedItem = { 
                ...item, 
                extraShotId,
                extraShot: { name: extraShotName, priceModifier: Number(priceModifier) }
              };
              updatedItem.basePrice = calculateItemPrice(updatedItem);
              updatedItem.discountedPrice = calculateItemPriceWithProductDiscount(updatedItem);
              updatedItem.calculatedPrice = updatedItem.discountedPrice;
              return updatedItem;
            }
            return item;
          });
          return { items: updatedItems };
        });
      },

      removeItemExtraShot: (cartItemId: string) => {
        set((state) => {
          const { calculateItemPrice, calculateItemPriceWithProductDiscount } = get();
          const updatedItems = state.items.map((item) => {
            if (item.cartItemId === cartItemId) {
              const updatedItem = { 
                ...item, 
                extraShotId: undefined,
                extraShot: undefined
              };
              updatedItem.basePrice = calculateItemPrice(updatedItem);
              updatedItem.discountedPrice = calculateItemPriceWithProductDiscount(updatedItem);
              updatedItem.calculatedPrice = updatedItem.discountedPrice;
              return updatedItem;
            }
            return item;
          });
          return { items: updatedItems };
        });
      },

      updateItemNote: (cartItemId: string, note: string) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.cartItemId === cartItemId ? { ...item, note } : item
          ),
        }));
      },
    }),
    {
      name: "cart-order-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useCart;