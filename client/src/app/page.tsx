"use client";

import Graph from "@/components/container/graph";
import Sidebars from "@/components/container/sidebars";
import useUser from "@/hooks/use-user";
import { useAppKitAccount } from "@reown/appkit/react";
import { useEffect } from "react";

export default function Home() {
  const { address } = useAppKitAccount();
  const { login, connectSocket } = useUser();
  useEffect(() => {
    if (address) {
      connectSocket(address);
      login(address);
    }

  }, [address]);



  return (
    <div className="flex flex-1 w-full h-full  gap-[15px]">
      <Graph />
      <Sidebars />
    </div>
  );
}
