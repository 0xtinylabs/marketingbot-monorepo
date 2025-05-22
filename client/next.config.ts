import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "export",
  env: {
    NEXT_PUBLIC_REOWN_PROJECT_ID: "9a25ea5d1603efc039b589d041a43a41",
    NEXT_PUBLIC_SOCKET_URL: "http://localhost:82",
    NEXT_PUBLIC_BE_URL: "http://localhost:3002",
  },
};

export default nextConfig;
