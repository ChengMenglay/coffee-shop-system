import { auth } from "@/auth";
import Singout from "@/components/Singout";
import React from "react";
async function Home() {
  const session = await auth();
  if (session) {
    console.log(session);
  }
  return <div>Home</div>;
}

export default Home;
