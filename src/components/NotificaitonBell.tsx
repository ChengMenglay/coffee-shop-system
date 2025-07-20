"use client";

import { Bell, X, Check, AlertCircle, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Notification } from "types";
import { toast } from "sonner";
import axios from "axios";
import { useRouter } from "next/navigation";

function NotificationBell({
  mockNotifications,
  userId,
}: {
  mockNotifications: Notification[];
  userId: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const unreadCount = mockNotifications.filter((n) => !n.read).length;

  const markAllAsRead = async () => {
    try {
      await axios.put("/api/notification", { userId, read: true });
      router.refresh();
    } catch (error) {
      console.error("Fail to mark all notificaion as read", error);
      toast.error("Fail to mark all notificaion as read");
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await axios.delete(`/api/notification/${notificationId}`);
      router.refresh();
    } catch (error) {
      console.error("Fail to delete a notificaion", error);
      toast.error("Fail to delete a notificaion");
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <Check className="w-4 h-4 text-green-500" />;
      case "warning":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case "info":
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsOpen(true)}
          className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <Bell className="w-6 h-6 text-gray-600" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center p-0 text-[10px] font-medium">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </button>
      </div>

      <AlertDialog open={isOpen} >
        <AlertDialogContent className="max-w-lg w-full h-[85vh] overflow-hidden flex flex-col">
          <AlertDialogHeader className="flex-shrink-0">
            <div className="flex items-center justify-between">
              <AlertDialogTitle>Notifications</AlertDialogTitle>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </AlertDialogHeader>

          <div className="flex-1 overflow-y-auto">
            {mockNotifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {mockNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg borde transition-colors ${
                      notification.read
                        ? "bg-gray-50 border-gray-200"
                        : "bg-blue-50 border-blue-200 hover:bg-blue-100"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {getIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4
                            className={`text-sm font-medium ${
                              notification.read
                                ? "text-gray-700"
                                : "text-gray-900"
                            }`}
                          >
                            {notification.title}
                          </h4>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <p
                          className={`text-xs mt-1 ${
                            notification.read
                              ? "text-gray-500"
                              : "text-gray-600"
                          }`}
                        >
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {notification.createdAt}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default NotificationBell;