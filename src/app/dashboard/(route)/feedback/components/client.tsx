"use client";

import Header from "@/components/Header";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { FeedbackColumn } from "./type";
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
  FileText,
  CheckCircle,
  XCircle,
  Calendar,
  ShoppingBag,
  Tag,
  Image as ImageIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import NoResult from "@/components/NoResult";
import Image from "next/image";

type FeedbackClientProps = {
  data: FeedbackColumn[];
  userId: string;
};

function FeedbackClient({ data, userId }: FeedbackClientProps) {
  const router = useRouter();
  const [openAlert, setOpenAlert] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string>("");
  const [loading, setLoading] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200";
      case "in_progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "closed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const resolveHandler = async (id: string, category: string) => {
    setLoading(id);
    try {
      const response = await axios.patch(`/api/feedback/${id}`, {
        status: "RESOLVED",
        updatedBy: userId,
      });
      if (response.status === 200) {
        toast.success("Feedback resolved successfully");
        router.refresh();
      }
    } catch (error) {
      console.error("Error resolving feedback:", error);
      toast.error("Failed to resolve feedback");
    } finally {
      setLoading("");
    }
  };

  const closeHandler = async (id: string) => {
    setLoading(id);
    try {
      const response = await axios.patch(`/api/feedback/${id}`, {
        status: "CLOSED",
        updatedBy: userId,
      });
      if (response.status === 200) {
        toast.success("Feedback closed successfully");
        setOpenAlert(false);
        setSelectedItem("");
        router.refresh();
      }
    } catch (error) {
      console.error("Error closing feedback:", error);
      toast.error("Failed to close feedback");
    } finally {
      setLoading("");
    }
  };

  const handleCloseClick = (id: string, category: string) => {
    setSelectedItem(id);
    setOpenAlert(true);
    setSelectedCategory(category);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2">
        <Header
          title="Feedback Management"
          subtitle="Review and manage customer feedback."
          total={data.length}
        />
      </div>
      <Separator className="my-6" />

      {data.length === 0 ? (
        <NoResult
          title="No Feedback Found"
          description="There are currently no pending feedback to review. New feedback
            will appear here when submitted."
        />
      ) : (
        <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6">
          {data.map((item) => (
            <Card
              key={item.id}
              className="p-6 shadow-sm hover:shadow-md transition-shadow duration-200 border-l-4 border-l-purple-500"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12 ring-2 ring-purple-100">
                    <AvatarImage src="/user.png" alt="user-profile" />
                    <AvatarFallback className="bg-purple-500 text-white font-medium">
                      {item.userName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {item.userName}
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
                    item.status
                  )} border font-medium`}
                >
                  {item.status}
                </Badge>
              </div>

              {/* Content */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-purple-500" />
                  <span className="font-medium text-gray-900">
                    {item.category}
                  </span>
                </div>

                {item.orderId && (
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-gray-600">
                      Order #{item.orderDisplayId || "N/A"}
                    </span>
                  </div>
                )}

                <div className="flex items-start gap-2 mt-3">
                  <FileText className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                  <div className="bg-gray-50 rounded-lg p-3 flex-1">
                    <p className="text-sm text-gray-700">{item.description}</p>
                  </div>
                </div>

                {item.images && item.images.length > 0 && (
                  <div className="mt-3">
                    <div className="flex items-center gap-2 mb-2">
                      <ImageIcon className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium text-gray-700">
                        Attachments ({item.images.length})
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {item.images.map((img, idx) => (
                        <div
                          key={idx}
                          className="relative aspect-square rounded-lg overflow-hidden border"
                        >
                          <Image
                            src={img}
                            alt={`Feedback image ${idx + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              {item.status === "PENDING" && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCloseClick(item.id, item.category)}
                    disabled={loading === item.id}
                    className="flex-1 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Close
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => resolveHandler(item.id, item.category)}
                    disabled={loading === item.id}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {loading === item.id ? "Processing..." : "Resolve"}
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
              Close Feedback
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              Are you sure you want to close this feedback? This action will
              mark the feedback as closed.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button
                variant="outline"
                onClick={() => {
                  setOpenAlert(false);
                  setSelectedItem("");
                }}
              >
                Cancel
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                variant="destructive"
                onClick={() => closeHandler(selectedItem)}
                disabled={loading === selectedItem}
              >
                {loading === selectedItem ? "Closing..." : "Confirm Close"}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default FeedbackClient;
