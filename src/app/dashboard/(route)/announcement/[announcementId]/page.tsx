import React from "react";
import { prisma } from "@/lib/prisma";
import { checkPermission } from "@/lib/check-permission";
import AnnouncementForm from "./AnnouncementForm";

async function AnnouncementPage({
  params,
}: {
  params: Promise<{ announcementId: string }>;
}) {
  const { announcementId } = await params;
  const announcement = await prisma.announcement.findUnique({
    where: { id: announcementId },
  });
  if (announcement === null) {
    await checkPermission(["create:announcement"]);
  } else {
    await checkPermission(["edit:announcement"]);
  }
  return (
    <div className="flex-col h-full">
      <div className="space-y-4 px-6 py-8">
        <AnnouncementForm initialData={announcement} />
      </div>
    </div>
  );
}

export default AnnouncementPage;
