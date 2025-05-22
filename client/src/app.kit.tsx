"use client";

import { createAppKit } from "@reown/appkit/react";
import { Ethers5Adapter } from "@reown/appkit-adapter-ethers5";
import { mainnet, base } from "@reown/appkit/networks";
import { PropsWithChildren } from "react";

// 1. Get projectId at https://cloud.reown.com
const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID ?? "";

// 2. Create a metadata object
const metadata = {
  name: "marketbot-test",
  description: "My Website description",
  url: "https://mywebsite.com", // origin must match your domain & subdomain
  icons: ["https://avatars.mywebsite.com/"],
};

// 3. Create the AppKit instance
createAppKit({
  adapters: [new Ethers5Adapter()],
  metadata: metadata,
  networks: [base, mainnet],
  projectId,
  features: {
    email: false,
    socials: false,
    allWallets: true,
    analytics: true, // Optional - defaults to your Cloud configuration
  },
});

export function AppKit({ children }: PropsWithChildren) {
  return children;
}
