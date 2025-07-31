// components/AutoRefresh.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AutoRefresh({
  interval = 5000,
}: {
  interval?: number;
}) {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => {
      router.refresh(); // Triggers a server re-render of current page
    }, interval);

    return () => clearInterval(id);
  }, [router, interval]);

  return null; // This component does not render anything
}
