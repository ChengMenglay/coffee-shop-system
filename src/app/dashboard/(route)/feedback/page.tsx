import React from "react";
import { prisma } from "@/lib/prisma";
import { FeedbackColumn } from "./components/type";
import { formatDistanceToNowStrict } from "date-fns";
import { checkPermission } from "@/lib/check-permission";
import FeedbackClient from "./components/client";
import { getUserId } from "@/app/(auth)/actions/authAction";

async function FeedbackPage() {
  await checkPermission(["view:feedback"]);
  const [feedbackPending, userID] = await Promise.all([
    prisma.feedback.findMany({
      where: { status: "PENDING" },
      include: {
        order: true,
        updatedBy: true,
        user: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    getUserId(),
  ]);

  const formattedFeedback: FeedbackColumn[] = feedbackPending.map((item) => ({
    id: item.id,
    userId: item.userId,
    userName: item.user.name,
    orderId: item.orderId,
    orderDisplayId: item.order?.displayId || null,
    category: item.category,
    description: item.description,
    images: item.images,
    status: item.status,
    updatedById: item.updatedById,
    updatedByName: item.updatedBy?.name || null,
    createdAt: formatDistanceToNowStrict(new Date(item.createdAt), {
      addSuffix: true,
    }),
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 px-6 py-8">
        <FeedbackClient userId={userID as string} data={formattedFeedback} />
      </div>
    </div>
  );
}

export default FeedbackPage;
