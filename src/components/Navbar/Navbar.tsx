import { auth } from "@/auth";
import React from "react";
import UserMenu from "./UserManu";
import NavAction from "./NavAction";
import { Separator } from "../ui/separator";
import Link from "next/link";
async function NavbarPage() {
  const session = await auth();
  const user = session?.user;
  return (
    <>
      <div className="flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          Coffee Shop
        </Link>
        <div className="flex items-center gap-4">
          <UserMenu name={user?.name as string} role={user?.role as string} />
          <NavAction />
        </div>
      </div>
      <Separator className="my-4" />
    </>
  );
}

export default NavbarPage;
