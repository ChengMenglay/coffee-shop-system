import React from "react";
import { prisma } from "@/lib/prisma";
import { AnnouncementColumn } from "./components/columns";
import { format } from "date-fns";
import { checkPermission } from "@/lib/check-permission";
import AnnouncementClient from "./components/client";
async function AnnouncementPage() {
  await checkPermission(["view:announcement"]);
  const announcements = await prisma.announcement.findMany({
    orderBy: { createdAt: "desc" },
  });
  const formattedAnnouncement: AnnouncementColumn[] = announcements.map((item) => ({
    id: item.id,
    title: item.title,
    content: item.content || "",
    image: item.image || "",
    isActive: item.isActive,
    createdAt: format(item.createdAt, "dd MMMM yyyy"),
  }));
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 px-6 py-8">
        <AnnouncementClient data={formattedAnnouncement} />
      </div>
    </div>
  );
}

export default AnnouncementPage;
