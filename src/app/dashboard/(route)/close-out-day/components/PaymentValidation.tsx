import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DollarSign, Calculator, RefreshCw, Banknote } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { CashCountData, CheckListdataType, PaymentValidationData } from "types";

type Currency = "USD" | "KHR";

interface CurrencyDenomination {
  name: string;
  label: string;
  value: number;
}

interface CashCountProps {
  onCashCountComplete: (paymentData: PaymentValidationData) => void;
}

const CashCount: React.FC<CashCountProps> = ({ onCashCountComplete }) => {
  const [currency, setCurrency] = React.useState<Currency>("USD");
  const [exchangeRate, setExchangeRate] = React.useState(4100); // 1 USD = 4100 KHR (approximate)

  // Currency denominations
  const usdDenominations: CurrencyDenomination[] = [
    { name: "hundreds", label: "$100", value: 100 },
    { name: "fifties", label: "$50", value: 50 },
    { name: "twenties", label: "$20", value: 20 },
    { name: "tens", label: "$10", value: 10 },
    { name: "fives", label: "$5", value: 5 },
    { name: "ones", label: "$1", value: 1 },
  ];

  const khrDenominations: CurrencyDenomination[] = [
    { name: "hundreds", label: "100,000 ៛", value: 100000 },
    { name: "fifties", label: "50,000 ៛", value: 50000 },
    { name: "twenties", label: "20,000 ៛", value: 20000 },
    { name: "tens", label: "10,000 ៛", value: 10000 },
    { name: "fives", label: "5,000 ៛", value: 5000 },
    { name: "ones", label: "1,000 ៛", value: 1000 },
  ];

  const usdCoins: CurrencyDenomination[] = [
    { name: "quarters", label: "$0.25", value: 0.25 },
    { name: "dimes", label: "$0.10", value: 0.1 },
    { name: "nickels", label: "$0.05", value: 0.05 },
    { name: "pennies", label: "$0.01", value: 0.01 },
  ];

  const khrCoins: CurrencyDenomination[] = [
    { name: "quarters", label: "500 ៛", value: 500 },
    { name: "dimes", label: "200 ៛", value: 200 },
    { name: "nickels", label: "100 ៛", value: 100 },
    { name: "pennies", label: "50 ៛", value: 50 },
  ];

  const [paymentData, setPaymentData] = React.useState<PaymentValidationData>({
    cash: {
      bills: {
        hundreds: 0,
        fifties: 0,
        twenties: 0,
        tens: 0,
        fives: 0,
        ones: 0,
      },
      coins: { quarters: 0, dimes: 0, nickels: 0, pennies: 0 },
      totalCounted: 0,
      systemTotal: 0,
      difference: 0,
    },
    aba: {
      enteredAmount: 0,
      systemTotal: 0,
      difference: 0,
    },
    creditCard: {
      enteredAmount: 0,
      systemTotal: 0,
      difference: 0,
    },
    notes: "",
    allPaymentsValidated: false,
  });

  const [isLoading, setIsLoading] = React.useState(false);
  const [systemData, setSystemData] = React.useState<{
    cash: CashCountData;
    payments: CheckListdataType["paymentData"];
  } | null>(null);

  React.useEffect(() => {
    fetchPaymentData();
  }, []);

  // Reset cash counts when currency changes
  React.useEffect(() => {
    setPaymentData((prev) => ({
      ...prev,
      cash: {
        ...prev.cash,
        bills: {
          hundreds: 0,
          fifties: 0,
          twenties: 0,
          tens: 0,
          fives: 0,
          ones: 0,
        },
        coins: { quarters: 0, dimes: 0, nickels: 0, pennies: 0 },
        totalCounted: 0,
        difference: -prev.cash.systemTotal,
      },
    }));
  }, [currency]);

  // Currency helper functions
  const formatCurrency = (
    amount: number,
    currencyType: Currency = currency
  ) => {
    if (currencyType === "USD") {
      return `$${amount.toFixed(2)}`;
    } else {
      return `${amount.toLocaleString()} ៛`;
    }
  };

  const convertToDisplayCurrency = (usdAmount: number) => {
    return currency === "USD" ? usdAmount : usdAmount * exchangeRate;
  };

  const convertToUSD = (amount: number) => {
    return currency === "USD" ? amount : amount / exchangeRate;
  };

  const getCurrentDenominations = () => {
    return currency === "USD" ? usdDenominations : khrDenominations;
  };

  const getCurrentCoins = () => {
    return currency === "USD" ? usdCoins : khrCoins;
  };

  const fetchPaymentData = async () => {
    try {
      setIsLoading(true);
      const today = new Date().toISOString().split("T")[0];

      // Fetch both cash count and daily report for all payment methods
      const [cashResponse, dailyResponse] = await Promise.all([
        axios.get(`/api/cash-count?date=${today}`),
        axios.get(`/api/reports/daily?date=${today}`),
      ]);

      if (cashResponse.data && dailyResponse.data) {
        setSystemData({
          cash: cashResponse.data,
          payments: dailyResponse.data.paymentMethods,
        });

        setPaymentData((prev) => ({
          ...prev,
          cash: {
            ...prev.cash,
            systemTotal: cashResponse.data.totalCashSales,
          },
          aba: {
            ...prev.aba,
            systemTotal: dailyResponse.data.paymentMethods.aba,
          },
          creditCard: {
            ...prev.creditCard,
            systemTotal: dailyResponse.data.paymentMethods.creditCard,
          },
        }));
      }
    } catch (error) {
      console.error("Error fetching payment data:", error);
      toast.error("Failed to fetch payment data");
    } finally {
      setIsLoading(false);
    }
  };

  const updateBill = (
    denomination: keyof PaymentValidationData["cash"]["bills"],
    count: number
  ) => {
    const newBills = { ...paymentData.cash.bills, [denomination]: count };
    calculateCashTotal(newBills, paymentData.cash.coins);
  };

  const updateCoin = (
    denomination: keyof PaymentValidationData["cash"]["coins"],
    count: number
  ) => {
    const newCoins = { ...paymentData.cash.coins, [denomination]: count };
    calculateCashTotal(paymentData.cash.bills, newCoins);
  };

  const calculateCashTotal = (
    bills: PaymentValidationData["cash"]["bills"],
    coins: PaymentValidationData["cash"]["coins"]
  ) => {
    const denominations = getCurrentDenominations();
    const coinDenominations = getCurrentCoins();

    const billTotal =
      bills.hundreds * denominations[0].value +
      bills.fifties * denominations[1].value +
      bills.twenties * denominations[2].value +
      bills.tens * denominations[3].value +
      bills.fives * denominations[4].value +
      bills.ones * denominations[5].value;

    const coinTotal =
      coins.quarters * coinDenominations[0].value +
      coins.dimes * coinDenominations[1].value +
      coins.nickels * coinDenominations[2].value +
      coins.pennies * coinDenominations[3].value;

    const totalCountedInCurrentCurrency = billTotal + coinTotal;
    const totalCountedInUSD = convertToUSD(totalCountedInCurrentCurrency);
    const difference = totalCountedInUSD - paymentData.cash.systemTotal;

    setPaymentData((prev) => ({
      ...prev,
      cash: {
        ...prev.cash,
        bills,
        coins,
        totalCounted: totalCountedInUSD,
        difference,
      },
    }));
  };

  const updateAbaAmount = (amount: number) => {
    const difference = amount - paymentData.aba.systemTotal;
    setPaymentData((prev) => ({
      ...prev,
      aba: {
        ...prev.aba,
        enteredAmount: amount,
        difference,
      },
    }));
  };

  const updateCreditCardAmount = (amount: number) => {
    const difference = amount - paymentData.creditCard.systemTotal;
    setPaymentData((prev) => ({
      ...prev,
      creditCard: {
        ...prev.creditCard,
        enteredAmount: amount,
        difference,
      },
    }));
  };

  const handleComplete = () => {
    if (
      paymentData.aba.systemTotal > 0 &&
      paymentData.aba.enteredAmount === 0
    ) {
      toast.error("Please enter the actual ABA payment amount received.");
      return;
    }

    if (
      paymentData.creditCard.systemTotal > 0 &&
      paymentData.creditCard.enteredAmount === 0
    ) {
      toast.error(
        "Please enter the actual Credit Card payment amount received."
      );
      return;
    }

    if (
      paymentData.cash.systemTotal > 0 &&
      paymentData.cash.totalCounted === 0
    ) {
      toast.error(
        "Please count the physical cash by entering bills and coins."
      );
      return;
    }

    // Check if all payments are validated (differences are acceptable)
    const cashAccurate = Math.abs(paymentData.cash.difference) < 0.01;
    const abaAccurate = Math.abs(paymentData.aba.difference) < 0.01;
    const creditCardAccurate =
      Math.abs(paymentData.creditCard.difference) < 0.01;

    const allPaymentsValidated =
      cashAccurate && abaAccurate && creditCardAccurate;

    if (!allPaymentsValidated) {
      const discrepancies = [];
      if (!cashAccurate)
        discrepancies.push(`Cash: $${paymentData.cash.difference.toFixed(2)}`);
      if (!abaAccurate)
        discrepancies.push(`ABA: $${paymentData.aba.difference.toFixed(2)}`);
      if (!creditCardAccurate)
        discrepancies.push(
          `Credit Card: $${paymentData.creditCard.difference.toFixed(2)}`
        );

      toast.error(
        `Payment discrepancies found: ${discrepancies.join(
          ", "
        )}. Please resolve before completing.`
      );
      return;
    }

    const finalData = {
      ...paymentData,
      allPaymentsValidated,
    };

    setPaymentData((prev) => ({ ...prev, allPaymentsValidated }));
    onCashCountComplete(finalData);
    toast.success(
      "Payment validation completed successfully! All amounts verified."
    );
  };

  const getDifferenceColor = (difference: number) => {
    if (Math.abs(difference) < 0.01) return "text-green-600";
    if (Math.abs(difference) <= 5) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <Card className="p-3 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3 sm:gap-0">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Payment Validation
          </h3>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Currency Switcher */}
            <div className="flex items-center gap-2">
              <Banknote className="w-4 h-4 text-gray-600" />
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className="px-3 py-1 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="USD">USD ($)</option>
                <option value="KHR">Cambodian Riel (៛)</option>
              </select>
            </div>
            {/* Exchange Rate Input for KHR */}
            {currency === "KHR" && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">1 USD =</span>
                <Input
                  type="number"
                  value={exchangeRate}
                  onChange={(e) =>
                    setExchangeRate(parseFloat(e.target.value) || 4100)
                  }
                  className="w-20 h-8 text-xs"
                  min="1000"
                  max="10000"
                  step="100"
                />
                <span className="text-sm text-gray-600">៛</span>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={fetchPaymentData}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>

        {/* Payment Summary */}
        {systemData && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              {`Today’s`} Payment Summary
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="text-center sm:text-left">
                <span className="text-gray-600">Cash Sales:</span>
                <p className="font-semibold text-lg">
                  {formatCurrency(
                    convertToDisplayCurrency(
                      systemData.cash?.totalCashSales || 0
                    )
                  )}
                </p>
              </div>
              <div className="text-center sm:text-left">
                <span className="text-gray-600">ABA Sales:</span>
                <p className="font-semibold text-lg">
                  {formatCurrency(
                    convertToDisplayCurrency(systemData.payments?.aba || 0)
                  )}
                </p>
              </div>
              <div className="text-center sm:text-left">
                <span className="text-gray-600">Credit Card Sales:</span>
                <p className="font-semibold text-lg">
                  {formatCurrency(
                    convertToDisplayCurrency(
                      systemData.payments?.creditCard || 0
                    )
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="animate-pulse">Loading payment data...</div>
          </div>
        )}
      </Card>

      {/* Cash Count Section */}
      <Card className="p-3 sm:p-6">
        <h4 className="font-medium mb-4 flex items-center gap-2">
          💵 Cash Count
          <span className="text-sm font-normal text-gray-600">
            ({currency === "USD" ? "US Dollars" : "Cambodian Riel"})
          </span>
        </h4>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Bills */}
          <div>
            <h5 className="font-medium mb-3">Bills</h5>
            <div className="space-y-2 sm:space-y-3">
              {getCurrentDenominations().map((denomination, index) => {
                const billKey = Object.keys(paymentData.cash.bills)[
                  index
                ] as keyof PaymentValidationData["cash"]["bills"];
                const billValue = paymentData.cash.bills[billKey];

                return (
                  <div
                    key={denomination.name}
                    className="flex items-center justify-between gap-2"
                  >
                    <span className="w-16 sm:w-20 text-xs sm:text-sm font-medium">
                      {denomination.label}
                    </span>
                    <Input
                      type="number"
                      min="0"
                      value={billValue}
                      onChange={(e) =>
                        updateBill(billKey, parseInt(e.target.value) || 0)
                      }
                      className="w-16 sm:w-20 text-center text-sm"
                    />
                    <span className="w-20 sm:w-24 text-right text-xs sm:text-sm">
                      {formatCurrency(billValue * denomination.value)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Coins */}
          <div>
            <h5 className="font-medium mb-3">Coins</h5>
            <div className="space-y-2 sm:space-y-3">
              {getCurrentCoins().map((denomination, index) => {
                const coinKey = Object.keys(paymentData.cash.coins)[
                  index
                ] as keyof PaymentValidationData["cash"]["coins"];
                const coinValue = paymentData.cash.coins[coinKey];

                return (
                  <div
                    key={denomination.name}
                    className="flex items-center justify-between gap-2"
                  >
                    <span className="w-16 sm:w-20 text-xs sm:text-sm font-medium">
                      {denomination.label}
                    </span>
                    <Input
                      type="number"
                      min="0"
                      value={coinValue}
                      onChange={(e) =>
                        updateCoin(coinKey, parseInt(e.target.value) || 0)
                      }
                      className="w-16 sm:w-20 text-center text-sm"
                    />
                    <span className="w-20 sm:w-24 text-right text-xs sm:text-sm">
                      {formatCurrency(coinValue * denomination.value)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Cash Totals */}
        <div className="mt-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">System Total</p>
              <p className="text-base sm:text-lg font-bold">
                {formatCurrency(
                  convertToDisplayCurrency(paymentData.cash.systemTotal),
                  "USD"
                )}
              </p>
              {currency === "KHR" && (
                <p className="text-xs text-gray-500">
                  (
                  {formatCurrency(
                    convertToDisplayCurrency(paymentData.cash.systemTotal)
                  )}
                  )
                </p>
              )}
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Counted Total</p>
              <p className="text-base sm:text-lg font-bold">
                {formatCurrency(
                  convertToDisplayCurrency(paymentData.cash.totalCounted),
                  "USD"
                )}
              </p>
              {currency === "KHR" && (
                <p className="text-xs text-gray-500">
                  (
                  {formatCurrency(
                    convertToDisplayCurrency(paymentData.cash.totalCounted)
                  )}
                  )
                </p>
              )}
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Difference</p>
              <p
                className={`text-base sm:text-lg font-bold ${getDifferenceColor(
                  paymentData.cash.difference
                )}`}
              >
                {formatCurrency(paymentData.cash.difference, "USD")}
              </p>
              {currency === "KHR" && (
                <p
                  className={`text-sm ${getDifferenceColor(
                    paymentData.cash.difference
                  )}`}
                >
                  ({formatCurrency(paymentData.cash.difference * exchangeRate)})
                </p>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* ABA Payment Validation */}
      <Card className="p-3 sm:p-6">
        <h4 className="font-medium mb-4">🏦 ABA Payment Validation</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Enter ABA Amount
            </label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={paymentData.aba.enteredAmount}
              onChange={(e) => updateAbaAmount(parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              System Total
            </label>
            <div className="p-2 bg-gray-100 rounded border font-semibold">
              {formatCurrency(paymentData.aba.systemTotal, "USD")}
              {currency === "KHR" && (
                <div className="text-sm text-gray-600 mt-1">
                  (
                  {formatCurrency(
                    convertToDisplayCurrency(paymentData.aba.systemTotal)
                  )}
                  )
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Difference</label>
            <div
              className={`p-2 rounded border font-semibold ${getDifferenceColor(
                paymentData.aba.difference
              )}`}
            >
              {formatCurrency(paymentData.aba.difference, "USD")}
              {currency === "KHR" && (
                <div
                  className={`text-sm mt-1 ${getDifferenceColor(
                    paymentData.aba.difference
                  )}`}
                >
                  ({formatCurrency(paymentData.aba.difference * exchangeRate)})
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Credit Card Payment Validation */}
      <Card className="p-3 sm:p-6">
        <h4 className="font-medium mb-4">💳 Credit Card Payment Validation</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Enter Credit Card Amount
            </label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={paymentData.creditCard.enteredAmount}
              onChange={(e) =>
                updateCreditCardAmount(parseFloat(e.target.value) || 0)
              }
              placeholder="0.00"
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              System Total
            </label>
            <div className="p-2 bg-gray-100 rounded border font-semibold">
              {formatCurrency(paymentData.creditCard.systemTotal, "USD")}
              {currency === "KHR" && (
                <div className="text-sm text-gray-600 mt-1">
                  (
                  {formatCurrency(
                    convertToDisplayCurrency(paymentData.creditCard.systemTotal)
                  )}
                  )
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Difference</label>
            <div
              className={`p-2 rounded border font-semibold ${getDifferenceColor(
                paymentData.creditCard.difference
              )}`}
            >
              {formatCurrency(paymentData.creditCard.difference, "USD")}
              {currency === "KHR" && (
                <div
                  className={`text-sm mt-1 ${getDifferenceColor(
                    paymentData.creditCard.difference
                  )}`}
                >
                  (
                  {formatCurrency(
                    paymentData.creditCard.difference * exchangeRate
                  )}
                  )
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Notes */}
      <Card className="p-3 sm:p-6">
        <label className="block text-sm font-medium mb-2">Notes</label>
        <Textarea
          value={paymentData.notes}
          onChange={(e) =>
            setPaymentData((prev) => ({ ...prev, notes: e.target.value }))
          }
          placeholder="Any discrepancies or notes about payment validation..."
          rows={3}
        />
      </Card>

      {/* Complete Button */}
      <div className="flex justify-center sm:justify-end">
        <Button
          onClick={handleComplete}
          size="lg"
          className={`w-full sm:w-auto ${
            Math.abs(paymentData.cash.difference) > 5 ||
            Math.abs(paymentData.aba.difference) > 5 ||
            Math.abs(paymentData.creditCard.difference) > 5
              ? "bg-yellow-600 hover:bg-yellow-700"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {Math.abs(paymentData.cash.difference) > 5 ||
          Math.abs(paymentData.aba.difference) > 5 ||
          Math.abs(paymentData.creditCard.difference) > 5
            ? "⚠️ Complete with Discrepancies"
            : "✅ Complete Payment Validation"}
        </Button>
      </div>
    </div>
  );
};

export default CashCount;
