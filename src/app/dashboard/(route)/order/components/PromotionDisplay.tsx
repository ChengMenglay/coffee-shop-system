"use client";
import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Promotion } from "types";
import { PromotionType } from "@prisma/client";
import {
  Gift,
  Percent,
  DollarSign,
  Calendar,
  Clock,
  Sparkles,
  Tag,
} from "lucide-react";
import { format } from "date-fns";

interface PromotionDisplayProps {
  promotions: Promotion[] | null;
}

const PromotionDisplay: React.FC<PromotionDisplayProps> = ({ promotions }) => {
  if (!promotions || promotions.length === 0) {
    return null;
  }

  const getPromotionIcon = (type: PromotionType) => {
    switch (type) {
      case PromotionType.BUY_X_GET_Y:
        return <Gift className="w-4 h-4" />;
      case PromotionType.PERCENT_DISCOUNT:
        return <Percent className="w-4 h-4" />;
      case PromotionType.FIXED_DISCOUNT:
        return <DollarSign className="w-4 h-4" />;
      default:
        return <Tag className="w-4 h-4" />;
    }
  };

  const getPromotionColor = (type: PromotionType) => {
    switch (type) {
      case PromotionType.BUY_X_GET_Y:
        return "bg-gradient-to-r from-purple-500 to-pink-500";
      case PromotionType.PERCENT_DISCOUNT:
        return "bg-gradient-to-r from-green-500 to-emerald-500";
      case PromotionType.FIXED_DISCOUNT:
        return "bg-gradient-to-r from-blue-500 to-cyan-500";
      default:
        return "bg-gradient-to-r from-gray-500 to-slate-500";
    }
  };

  const getPromotionText = (promotion: Promotion) => {
    switch (promotion.type) {
      case PromotionType.BUY_X_GET_Y:
        return `Buy ${promotion.buyQuantity} Get ${promotion.freeQuantity} Free`;
      case PromotionType.PERCENT_DISCOUNT:
        return `${promotion.discount}% Off`;
      case PromotionType.FIXED_DISCOUNT:
        return `$${promotion.discount} Off`;
      default:
        return "Special Offer";
    }
  };

  const isPromotionActive = (promotion: Promotion) => {
    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);
    return now >= startDate && now <= endDate;
  };

  const isPromotionUpcoming = (promotion: Promotion) => {
    const now = new Date();
    const startDate = new Date(promotion.startDate);
    return now < startDate;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-yellow-500" />
        <h3 className="text-sm font-semibold text-gray-700">
          Active Promotions
        </h3>
      </div>

      <div className="space-y-2 max-h-32 overflow-y-auto">
        {promotions.map((promotion) => (
          <Card
            key={promotion.id}
            className={`p-3 border-0 shadow-sm relative overflow-hidden ${
              !isPromotionActive(promotion) ? "opacity-60" : ""
            }`}
          >
            {/* Background gradient */}
            <div
              className={`absolute inset-0 ${getPromotionColor(
                promotion.type
              )} opacity-10`}
            />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`p-1.5 rounded-full ${getPromotionColor(
                      promotion.type
                    )} text-white`}
                  >
                    {getPromotionIcon(promotion.type)}
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-gray-800 truncate">
                      {promotion.name}
                    </h4>
                    <p className="text-xs font-semibold text-gray-600">
                      {getPromotionText(promotion)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  {isPromotionActive(promotion) && (
                    <Badge
                      variant="default"
                      className="text-xs bg-green-100 text-green-700 hover:bg-green-100"
                    >
                      Active
                    </Badge>
                  )}
                  {isPromotionUpcoming(promotion) && (
                    <Badge
                      variant="secondary"
                      className="text-xs bg-orange-100 text-orange-700"
                    >
                      Upcoming
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{format(new Date(promotion.startDate), "MMM dd")}</span>
                  <span>-</span>
                  <span>{format(new Date(promotion.endDate), "MMM dd")}</span>
                </div>

                {isPromotionActive(promotion) && (
                  <div className="flex items-center gap-1 text-green-600">
                    <Clock className="w-3 h-3" />
                    <span className="font-medium">Available now</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PromotionDisplay;
