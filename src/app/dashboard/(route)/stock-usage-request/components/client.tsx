"use client";

import Header from "@/components/Header";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import axios from "axios";
import {
  Clock,
  Package,
  FileText,
  CheckCircle,
  XCircle,
  Calendar,
  Hash,
} from "lucide-react";
import { StockUsageColumn } from "./type";
import { Badge } from "@/components/ui/badge";
import NoResult from "@/components/NoResult";

type StockUsageColumnProps = {
  data: StockUsageColumn[];
  userId: string;
};

function StockUsageClient({ data, userId }: StockUsageColumnProps) {
  const router = useRouter();
  const [openAlert, setOpenAlert] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string>("");
  const [rejectionNote, setRejectionNote] = useState("");
  const [loading, setLoading] = useState<string>("");
  const [selectedIngredient, setSelectedIngredient] = useState("");
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const approveHandler = async (id: string, ingredient: string) => {
    setLoading(id);
    try {
      const response = await axios.patch(`/api/stock-usage-request/${id}`, {
        approvalStatus: "Approved",
        approvedById: userId,
        approvedAt: new Date(),
      });
      if (response.status === 200) {
        await axios.post("/api/notification", {
          title: `Your ${ingredient} Request Approved`,
          userId: response.data.userId,
          message: `Your stock usage request for ${ingredient} has been approved.`,
          type: "success",
        });
        toast.success("Stock usage request approved successfully");
        router.refresh();
      }
    } catch (error) {
      console.error("Error approving stock usage request:", error);
      toast.error("Failed to approve stock usage request");
    } finally {
      setLoading("");
    }
  };

  const rejectHandler = async (id: string) => {
    if (!rejectionNote.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    setLoading(id);
    try {
      const response = await axios.patch(`/api/stock-usage-request/${id}`, {
        approvalStatus: "Rejected",
        rejectionReason: rejectionNote,
        approvedById: userId,
        approvedAt: new Date(),
      });
      if (response.status === 200) {
        await axios.post("/api/notification", {
          title: `Your ${selectedIngredient} Request Rejected`,
          userId: response.data.userId,
          message: `Your stock usage request for ${selectedIngredient} has been rejected. Reason: ${response.data.rejectionReason}`,
          type: "error",
        });
        toast.success("Stock Usage request rejected successfully");
        setOpenAlert(false);
        setRejectionNote("");
        setSelectedItem("");
        router.refresh();
      }
    } catch (error) {
      console.error("Error rejecting stock usage request:", error);
      toast.error("Failed to reject stock usage request");
    } finally {
      setLoading("");
    }
  };

  const handleRejectClick = (id: string, ingredient: string) => {
    setSelectedItem(id);
    setSelectedIngredient(ingredient);
    setOpenAlert(true);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2">
        <Header
          title="Stock Usage Request"
          subtitle="Manage stock usage requests for your store."
          total={data.length}
        />
      </div>
      <Separator className="my-6" />

      {data.length === 0 ? (
        <NoResult
          title="No Stock Usage Requests Found"
          description="There are currently no stock usage requests to review. New requests
            will appear here when submitted."
        />
      ) : (
        <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6">
          {data.map((item) => (
            <Card
              key={item.id}
              className="p-6 shadow-sm hover:shadow-md transition-shadow duration-200 border-l-4 border-l-blue-500"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12 ring-2 ring-blue-100">
                    <AvatarImage src="/user.png" alt="user-profile" />
                    <AvatarFallback className="bg-blue-500 text-white font-medium">
                      {item.requestedBy.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {item.requestedBy}
                    </p>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Calendar className="w-3 h-3" />
                      {item.createdAt}
                    </div>
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className={`${getStatusColor(
                    item.approvalStatus
                  )} border font-medium`}
                >
                  {item.approvalStatus}
                </Badge>
              </div>

              {/* Content */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-500" />
                  <span className="font-medium text-gray-900">
                    {item.ingredient}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-600">
                    Quantity:{" "}
                    <span className="font-medium">{item.quantity}</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span className="text-sm text-gray-600">
                    Status: <span className="font-medium">{item.status}</span>
                  </span>
                </div>

                {item.note && (
                  <div className="flex items-start gap-2 mt-3">
                    <FileText className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    <div className="bg-gray-50 rounded-lg p-3 flex-1">
                      <p className="text-sm text-gray-700 italic">
                        {item.note}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              {item.approvalStatus === "Pending" && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRejectClick(item.id, item.ingredient)}
                    disabled={loading === item.id}
                    className="flex-1 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => approveHandler(item.id, item.ingredient)}
                    disabled={loading === item.id}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {loading === item.id ? "Processing..." : "Approve"}
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={openAlert} onOpenChange={setOpenAlert}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              Reject Stock Usage Request
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              Please provide a clear reason for rejecting this stock usage
              request. This information will be shared with the requester.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Reason for Rejection *
              </label>
              <Textarea
                className="w-full resize-none"
                placeholder="Please provide a detailed reason for rejection..."
                value={rejectionNote}
                onChange={(e) => setRejectionNote(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button
                variant="outline"
                onClick={() => {
                  setOpenAlert(false);
                  setRejectionNote("");
                  setSelectedItem("");
                }}
              >
                Cancel
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                variant="destructive"
                onClick={() => rejectHandler(selectedItem)}
                disabled={!rejectionNote.trim() || loading === selectedItem}
              >
                {loading === selectedItem
                  ? "Rejecting..."
                  : "Confirm Rejection"}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default StockUsageClient;
