import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";

const inter = Inter({ subsets: ["latin"] });
export const metadata: Metadata = {
  title: "Coffee Shop",
  description: "A Next.js Coffee Shop Application",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider session={session}>
          <main>{children}</main>
          <Toaster position="top-center" richColors />
        </SessionProvider>
      </body>
    </html>
  );
}
