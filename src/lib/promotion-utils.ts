import { CartItem } from "@/hooks/use-cart";
import { Promotion } from "types";
import { PromotionType } from "@prisma/client";

export interface PromotionApplication {
  promotionId: string;
  promotionName: string;
  type: PromotionType;
  discountAmount: number;
  appliedToItems: string[]; // CartItem IDs
  freeItems?: {
    cartItemId: string;
    quantity: number;
  }[];
}

interface PromotionCalculationResult {
  totalDiscount: number;
  appliedPromotions: PromotionApplication[];
  updatedItems: CartItem[];
}

// Check if promotion is currently active
export const isPromotionActive = (promotion: Promotion): boolean => {
  const now = new Date();
  const startDate = new Date(promotion.startDate);
  const endDate = new Date(promotion.endDate);
  return promotion.isActive && now >= startDate && now <= endDate;
};

// Calculate promotions for cart items
export const calculatePromotions = (
  items: CartItem[],
  promotions: Promotion[] | null,
  calculateItemPrice: (item: CartItem) => number
): PromotionCalculationResult => {
  if (!promotions || promotions.length === 0) {
    return {
      totalDiscount: 0,
      appliedPromotions: [],
      updatedItems: items,
    };
  }

  const activePromotions = promotions.filter(isPromotionActive);
  const appliedPromotions: PromotionApplication[] = [];
  let totalDiscount = 0;
  const updatedItems = [...items];

  // Sort promotions by priority (BUY_X_GET_Y first, then others)
  const sortedPromotions = activePromotions.sort((a, b) => {
    if (
      a.type === PromotionType.BUY_X_GET_Y &&
      b.type !== PromotionType.BUY_X_GET_Y
    ) {
      return -1;
    }
    if (
      a.type !== PromotionType.BUY_X_GET_Y &&
      b.type === PromotionType.BUY_X_GET_Y
    ) {
      return 1;
    }
    return 0;
  });

  for (const promotion of sortedPromotions) {
    const eligibleItems = updatedItems.filter(
      () =>
        true
    );

    if (eligibleItems.length === 0) continue;

    switch (promotion.type) {
      case PromotionType.BUY_X_GET_Y: {
        const buyQuantity = promotion.buyQuantity || 0;
        const freeQuantity = promotion.freeQuantity || 0;

        if (buyQuantity <= 0 || freeQuantity <= 0) break;

        // Calculate total quantity across ALL eligible items in cart
        const totalCartQuantity = eligibleItems.reduce(
          (sum, item) => sum + item.quantity,
          0
        );

        // Check if cart meets the minimum buy quantity requirement
        if (totalCartQuantity < buyQuantity) break;

        // Calculate how many promotion sets are eligible
        const setsEligible = Math.floor(totalCartQuantity / buyQuantity);
        const totalFreeItems = Math.min(
          setsEligible * freeQuantity,
          totalCartQuantity - buyQuantity
        );

        if (totalFreeItems > 0) {
          // Keep items in their original order (don't sort by price)
          // We want to apply discount to the "additional" items, not necessarily the cheapest

          let processedQuantity = 0;
          let remainingFreeItems = totalFreeItems;
          let promotionDiscount = 0;
          const appliedItemIds: string[] = [];

          // First pass: Count items until we reach the "buy quantity" threshold
          // Second pass: Apply discounts to items after the threshold

          for (const item of eligibleItems) {
            if (remainingFreeItems <= 0) break;

            const itemPrice = calculateItemPrice(item);
            let freeFromThisItem = 0;

            if (processedQuantity >= buyQuantity) {
              // We're past the buy threshold, these items can be free
              freeFromThisItem = Math.min(item.quantity, remainingFreeItems);
            } else if (processedQuantity + item.quantity > buyQuantity) {
              // This item crosses the buy threshold
              const itemsAfterThreshold =
                processedQuantity + item.quantity - buyQuantity;
              freeFromThisItem = Math.min(
                itemsAfterThreshold,
                remainingFreeItems
              );
            }
            // else: This item is entirely within the "buy" portion, no discount

            if (freeFromThisItem > 0) {
              promotionDiscount += itemPrice * freeFromThisItem;
              remainingFreeItems -= freeFromThisItem;
              appliedItemIds.push(item.cartItemId);
            }

            processedQuantity += item.quantity;
          }

          if (promotionDiscount > 0) {
            appliedPromotions.push({
              promotionId: promotion.id,
              promotionName: promotion.name,
              type: promotion.type,
              discountAmount: promotionDiscount,
              appliedToItems: appliedItemIds,
            });
            totalDiscount += promotionDiscount;
          }
        }
        break;
      }

      case PromotionType.PERCENT_DISCOUNT: {
        const discountPercent = promotion.discount || 0;
        if (discountPercent <= 0) break;

        let promotionDiscount = 0;
        const appliedItemIds: string[] = [];

        for (const item of eligibleItems) {
          const itemPrice = calculateItemPrice(item);
          const itemDiscount =
            (itemPrice * item.quantity * discountPercent) / 100;
          promotionDiscount += itemDiscount;
          appliedItemIds.push(item.cartItemId);
        }

        if (promotionDiscount > 0) {
          appliedPromotions.push({
            promotionId: promotion.id,
            promotionName: promotion.name,
            type: promotion.type,
            discountAmount: promotionDiscount,
            appliedToItems: appliedItemIds,
          });
          totalDiscount += promotionDiscount;
        }
        break;
      }

      case PromotionType.FIXED_DISCOUNT: {
        const discountAmount = promotion.discount || 0;
        if (discountAmount <= 0) break;

        // Apply fixed discount to eligible items proportionally
        const totalEligibleValue = eligibleItems.reduce(
          (sum, item) => sum + calculateItemPrice(item) * item.quantity,
          0
        );

        if (totalEligibleValue > 0) {
          const actualDiscount = Math.min(discountAmount, totalEligibleValue);
          const appliedItemIds = eligibleItems.map((item) => item.cartItemId);

          appliedPromotions.push({
            promotionId: promotion.id,
            promotionName: promotion.name,
            type: promotion.type,
            discountAmount: actualDiscount,
            appliedToItems: appliedItemIds,
          });
          totalDiscount += actualDiscount;
        }
        break;
      }
    }
  }

  return {
    totalDiscount,
    appliedPromotions,
    updatedItems,
  };
};
