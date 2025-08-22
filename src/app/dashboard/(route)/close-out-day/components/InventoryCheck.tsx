import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Package, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { CheckListdataType } from "types";

interface InventoryCheckProps {
  onInventoryComplete: (data: CheckListdataType["inventoryData"]) => void;
}

interface InventoryItem {
  id: string;
  name: string;
  currentStock: number;
  threshold: number;
  unit: string;
  isLow: boolean;
  physicalCount?: number;
  discrepancy?: number;
  notes?: string;
}

const InventoryCheck: React.FC<InventoryCheckProps> = ({
  onInventoryComplete,
}) => {
  const [inventoryData, setInventoryData] = React.useState<
    CheckListdataType["inventoryData"]
  >({
    items: [],
    totalDiscrepancies: 0,
    lowStockCount: 0,
    notes: "",
    completed: false,
  });

  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("/api/inventory-check");

      if (response.data && response.data.items) {
        setInventoryData((prev) => ({
          ...prev,
          items: response.data.items,
          lowStockCount: response.data.lowStockCount,
        }));
      }
    } catch (error) {
      console.error("Error fetching inventory data:", error);
      toast.error("Failed to fetch inventory data");

      // Set empty data structure if API fails
      setInventoryData({
        items: [],
        totalDiscrepancies: 0,
        lowStockCount: 0,
        notes: "",
        completed: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotals = React.useCallback(() => {
    const totalDiscrepancies = inventoryData.items.reduce(
      (sum, item) => sum + Math.abs(item.discrepancy || 0),
      0
    );
    const lowStockCount = inventoryData.items.filter(
      (item) => item.isLow
    ).length;

    setInventoryData((prev) => ({
      ...prev,
      totalDiscrepancies,
      lowStockCount,
    }));
  }, [inventoryData.items]);

  React.useEffect(() => {
    calculateTotals();
  }, [calculateTotals]);

  const updatePhysicalCount = (itemId: string, physicalCount: number) => {
    const updatedItems = inventoryData.items.map((item) => {
      if (item.id === itemId) {
        const discrepancy = physicalCount - item.currentStock;
        return { ...item, physicalCount, discrepancy };
      }
      return item;
    });

    setInventoryData((prev) => ({ ...prev, items: updatedItems }));
  };

  const updateItemNotes = (itemId: string, notes: string) => {
    const updatedItems = inventoryData.items.map((item) =>
      item.id === itemId ? { ...item, notes } : item
    );

    setInventoryData((prev) => ({ ...prev, items: updatedItems }));
  };

  const handleComplete = () => {
    const completed = inventoryData.items.every(
      (item) => item.physicalCount !== undefined
    );

    if (!completed) {
      toast.info("Please complete physical count for all items");
      return;
    }

    const finalData = { ...inventoryData, completed: true };
    setInventoryData(finalData);
    onInventoryComplete(finalData);
  };

  const getStatusBadge = (item: InventoryItem) => {
    if (item.physicalCount === undefined) {
      return (
        <Badge variant="secondary" className="text-xs">
          Pending
        </Badge>
      );
    }
    if (Math.abs(item.discrepancy || 0) === 0) {
      return (
        <Badge variant="default" className="bg-green-600 text-xs">
          Match
        </Badge>
      );
    }
    if (Math.abs(item.discrepancy || 0) <= 2) {
      return (
        <Badge variant="secondary" className="bg-yellow-600 text-xs">
          Minor
        </Badge>
      );
    }
    return (
      <Badge variant="destructive" className="text-xs">
        Major
      </Badge>
    );
  };

  return (
    <Card className="p-3 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3 sm:gap-0">
        <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
          <Package className="w-4 h-4 sm:w-5 sm:h-5" />
          Inventory Check
        </h3>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchInventoryData}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={
                inventoryData.lowStockCount > 0 ? "destructive" : "default"
              }
              className="text-xs"
            >
              {inventoryData.lowStockCount} Low Stock
            </Badge>
            <Badge
              variant={
                inventoryData.totalDiscrepancies > 0 ? "secondary" : "default"
              }
              className="text-xs"
            >
              {inventoryData.totalDiscrepancies.toFixed(1)} Total Variance
            </Badge>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="mb-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
          <div className="animate-pulse text-sm">Loading inventory data...</div>
        </div>
      )}

      {inventoryData.items.length === 0 && !isLoading && (
        <div className="mb-4 p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-2 text-yellow-700">
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" />
            <span className="text-sm">
              No inventory items found. Please check your database connection.
            </span>
          </div>
        </div>
      )}

      <div className="space-y-3 sm:space-y-4">
        {inventoryData.items.map((item: InventoryItem) => (
          <Card key={item.id} className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2 sm:gap-0">
              <div className="flex items-center gap-2 sm:gap-3">
                <h4 className="font-medium text-sm sm:text-base">
                  {item.name}
                </h4>
                {item.isLow && (
                  <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
                )}
                {getStatusBadge(item)}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">
                System: {item.currentStock} {item.unit}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1">
                  Physical Count
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={item.physicalCount || ""}
                  onChange={(e) =>
                    updatePhysicalCount(
                      item.id,
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className="w-full px-2 sm:px-3 py-2 border rounded-md text-sm"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1">
                  Variance
                </label>
                <div
                  className={`px-2 sm:px-3 py-2 rounded-md text-sm ${
                    item.discrepancy === undefined
                      ? "bg-gray-100"
                      : Math.abs(item.discrepancy) === 0
                      ? "bg-green-100 text-green-700"
                      : Math.abs(item.discrepancy) <= 2
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {item.discrepancy !== undefined
                    ? `${
                        item.discrepancy > 0 ? "+" : ""
                      }${item.discrepancy.toFixed(1)}`
                    : "-"}
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1">
                  Status
                </label>
                <div className="flex items-center py-2">
                  {item.isLow ? (
                    <span className="text-red-600 text-xs sm:text-sm">
                      Below Threshold
                    </span>
                  ) : (
                    <span className="text-green-600 text-xs sm:text-sm">
                      Adequate Stock
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  value={item?.notes || ""}
                  onChange={(e) => updateItemNotes(item.id, e.target.value)}
                  className="w-full px-2 sm:px-3 py-2 border rounded-md text-xs sm:text-sm"
                  placeholder="Any notes..."
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-4 sm:mt-6">
        <label className="block text-xs sm:text-sm font-medium mb-2">
          Overall Notes
        </label>
        <Textarea
          value={inventoryData.notes}
          onChange={(e) =>
            setInventoryData((prev) => ({ ...prev, notes: e.target.value }))
          }
          placeholder="Any general inventory notes or observations..."
          rows={3}
          className="text-sm"
        />
      </div>

      <div className="mt-4 sm:mt-6 flex justify-center sm:justify-end">
        <Button
          onClick={handleComplete}
          disabled={inventoryData.completed}
          className={`w-full sm:w-auto ${
            inventoryData.totalDiscrepancies > 5
              ? "bg-yellow-600 hover:bg-yellow-700"
              : ""
          }`}
        >
          {inventoryData.completed ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Inventory Complete
            </>
          ) : (
            "Complete Inventory Check"
          )}
        </Button>
      </div>
    </Card>
  );
};

export default InventoryCheck;
